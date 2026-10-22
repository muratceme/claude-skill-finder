#!/usr/bin/env node
/**
 * Collect Claude / Agent Skills (SKILL.md files) from GitHub into site/data/skills.json
 *
 * Pipeline
 *  1. Seeds (scripts/sources.json) + optional GitHub API discovery (topics, code search)
 *  2. Awesome-list crawling: README links -> more repos (one hop)
 *  3. Shallow git clone of every repo (git works even where the REST API is blocked)
 *  4. Parse every SKILL.md (frontmatter + body), de-duplicate, categorize (scripts/taxonomy.json)
 *  5. Write site/data/skills.json + site/data/stats.json
 *
 * Flags: --max-repos N   --no-api   --no-crawl   --no-fetch   --cache-dir DIR   --out FILE   --only owner/repo[,owner/repo]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseSkillMarkdown, firstParagraph, firstHeading, clip, toStr } from './lib/frontmatter.mjs';
import { categorize, categoryTree } from './lib/categorize.mjs';
import * as gh from './lib/github.mjs';

const pexec = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const args = parseArgs(process.argv.slice(2));
const SOURCES = JSON.parse(fs.readFileSync(path.join(__dirname, 'sources.json'), 'utf8'));
const CACHE = path.resolve(args['cache-dir'] || path.join(ROOT, '.cache', 'repos'));
const OUT = path.resolve(args.out || path.join(ROOT, 'site', 'data', 'skills.json'));
const MAX_REPOS = args['max-repos'] ? Number(args['max-repos']) : Infinity;
const USE_API = !args['no-api'];
const USE_CRAWL = !args['no-crawl'] && SOURCES.crawl.followAwesomeLinks;
const ONLY = args.only ? new Set(String(args.only).split(',').map(s => s.trim().toLowerCase())) : null;
const NO_FETCH = !!args['no-fetch']; // reuse cached clones without touching the network
const CONCURRENCY = Number(SOURCES.crawl.concurrency || 6);
const CLONE_TIMEOUT = Number(SOURCES.crawl.cloneTimeoutMs || 150000);
const SKIP_PATH = SOURCES.skipPathPatterns.map(p => p.toLowerCase());
const IGNORE_REPOS = new Set((SOURCES.crawl.ignoreRepos || []).map(s => s.toLowerCase()));
const IGNORE_OWNERS = new Set((SOURCES.crawl.ignoreOwners || []).map(s => s.toLowerCase()));
const AGGREGATORS = new Set((SOURCES.crawl.aggregators || []).map(s => s.toLowerCase())); // mirrors of other repos: lose de-dup ties

fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(path.dirname(OUT), { recursive: true });

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ---------------------------------------------------------------- repos registry
/** @type {Map<string, {fullName, owner, name, kind, official, foundVia:Set<string>, info?:object}>} */
const repos = new Map();
function addRepo(fullName, { kind = 'discovered', official = false, via = 'seed' } = {}) {
  const fn = normalizeRepo(fullName);
  if (!fn) return null;
  const key = fn.toLowerCase();
  const [owner, name] = fn.split('/');
  if (IGNORE_REPOS.has(key) || IGNORE_OWNERS.has(owner.toLowerCase())) return null;
  if (ONLY && !ONLY.has(key)) return null;
  let r = repos.get(key);
  if (!r) { r = { fullName: fn, owner, name, kind, official, foundVia: new Set() }; repos.set(key, r); }
  if (official) r.official = true;
  if (kind === 'collection' || kind === 'awesome') r.kind = r.kind === 'discovered' ? kind : r.kind;
  r.foundVia.add(via);
  return r;
}
function normalizeRepo(s) {
  const m = String(s).trim().match(/^([A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/);
  if (!m) return null;
  if (/^\.+$/.test(m[2])) return null;
  return `${m[1]}/${m[2]}`;
}

// ---------------------------------------------------------------- git helpers
async function run(cmd, cmdArgs, { cwd, timeout = CLONE_TIMEOUT } = {}) {
  return pexec(cmd, cmdArgs, { cwd, timeout, maxBuffer: 64 * 1024 * 1024, env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_LFS_SKIP_SMUDGE: '1' } });
}
const SPARSE = ['/*.md', '/*.MD', '/*.markdown', '/.claude-plugin/*', '**/SKILL.md', '**/skill.md', '**/Skill.md', '**/.claude-plugin/plugin.json'];
/**
 * Blob-limited partial clone + sparse checkout: we only ever materialize SKILL.md files, root READMEs and
 * plugin manifests, so even repos with hundreds of MB of assets cost a few MB and ~1s.
 */
async function cloneOrUpdate(r) {
  const dir = path.join(CACHE, `${r.owner}__${r.name}`);
  const url = `https://github.com/${r.fullName}.git`;
  if (fs.existsSync(path.join(dir, '.git'))) {
    if (NO_FETCH) return dir;
    try {
      await run('git', ['-C', dir, 'fetch', '-q', '--depth=1', '--filter=blob:limit=512k', 'origin', 'HEAD']);
      await run('git', ['-C', dir, 'reset', '-q', '--hard', 'FETCH_HEAD']);
      return dir;
    } catch (e) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  fs.rmSync(dir, { recursive: true, force: true });
  if (NO_FETCH) throw new Error('not in cache (--no-fetch)');
  await run('git', ['clone', '-q', '--depth', '1', '--single-branch', '--no-tags', '--filter=blob:limit=512k', '--no-checkout', '-c', 'core.longpaths=true', url, dir]);
  await run('git', ['-C', dir, 'sparse-checkout', 'set', '--no-cone', ...SPARSE], { timeout: 60000 });
  await run('git', ['-C', dir, 'checkout', '-q'], { timeout: CLONE_TIMEOUT });
  return dir;
}
/** Full path listing of HEAD (cheap, no blobs needed) used for directory existence checks. */
async function treePaths(dir) {
  try {
    const { stdout } = await run('git', ['-C', dir, 'ls-tree', '-r', '--name-only', 'HEAD'], { timeout: 60000 });
    return stdout.split('\n').filter(Boolean);
  } catch { return []; }
}
async function headInfo(dir) {
  try {
    const { stdout } = await run('git', ['-C', dir, 'log', '-1', '--format=%H%n%cI'], { timeout: 20000 });
    const [sha, date] = stdout.trim().split('\n');
    let branch = 'main';
    try {
      const b = await run('git', ['-C', dir, 'rev-parse', '--abbrev-ref', 'HEAD'], { timeout: 20000 });
      if (b.stdout.trim() && b.stdout.trim() !== 'HEAD') branch = b.stdout.trim();
    } catch {}
    return { sha, date, branch };
  } catch { return { sha: '', date: '', branch: 'main' }; }
}

// ---------------------------------------------------------------- file walking
function walk(dir, { maxDepth = 12 } = {}) {
  const out = [];
  const stack = [[dir, 0]];
  while (stack.length) {
    const [d, depth] = stack.pop();
    let ents;
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const e of ents) {
      if (e.name === '.git' || e.name === 'node_modules') continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (depth < maxDepth) stack.push([p, depth + 1]); }
      else if (e.isFile() && /^skill\.md$/i.test(e.name)) out.push(p);
    }
  }
  return out;
}

function readmeLinks(dir) {
  const out = new Map(); // fullName -> hintPath
  let files = [];
  try { files = fs.readdirSync(dir).filter(f => /\.(md|mdx|markdown)$/i.test(f)); } catch {}
  for (const f of files) {
    let txt = '';
    try { txt = fs.readFileSync(path.join(dir, f), 'utf8'); } catch { continue; }
    const re = /github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)\/([A-Za-z0-9_.-]+?)(?:\/(?:tree|blob)\/[^\s)"'<>]+?)?(?=[\s)"'<>#?,]|$)/g;
    let m;
    while ((m = re.exec(txt))) {
      const owner = m[1], name = m[2].replace(/\.git$/, '');
      if (IGNORE_OWNERS.has(owner.toLowerCase())) continue;
      if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(name)) continue;
      const fn = `${owner}/${name}`;
      if (!out.has(fn)) out.set(fn, (m[0].match(/\/(?:tree|blob)\/[^/]+\/(.+)$/) || [])[1] || '');
    }
  }
  return out;
}

// ---------------------------------------------------------------- plugin / marketplace detection
function readJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
function repoFacts(dir) {
  const mk = readJson(path.join(dir, '.claude-plugin', 'marketplace.json'));
  const pl = readJson(path.join(dir, '.claude-plugin', 'plugin.json'));
  return {
    marketplace: mk ? { name: toStr(mk.name) || undefined, plugins: Array.isArray(mk.plugins) ? mk.plugins.map(p => ({ name: toStr(p.name), source: typeof p.source === 'string' ? p.source : (p.source?.path || p.source?.url || ''), description: clip(toStr(p.description), 160) })).filter(p => p.name) : [] } : null,
    rootPlugin: pl ? toStr(pl.name) : '',
  };
}
/** Walk up from the skill directory to find the enclosing plugin (plugin.json). */
function enclosingPlugin(dir, skillDirRel) {
  let cur = skillDirRel === '.' ? '' : skillDirRel;
  for (let i = 0; i < 8; i++) {
    const pj = readJson(path.join(dir, cur, '.claude-plugin', 'plugin.json'));
    if (pj && toStr(pj.name)) return { name: toStr(pj.name), path: cur };
    if (!cur) break;
    const parent = path.posix.dirname(cur);
    cur = parent === '.' ? '' : parent;
  }
  return null;
}

// ---------------------------------------------------------------- skill extraction
function extractSkills(r, dir, head, tree) {
  const files = walk(dir);
  const skills = [];
  const facts = repoFacts(dir);
  r.facts = facts;
  const dirs = new Set();
  for (const p of tree) { const i = p.lastIndexOf('/'); if (i > 0) { let d = p.slice(0, i); while (d && !dirs.has(d)) { dirs.add(d); const j = d.lastIndexOf('/'); d = j > 0 ? d.slice(0, j) : ''; } } }
  const hasDir = (base, name) => dirs.has(base === '.' ? name : `${base}/${name}`);
  for (const file of files) {
    const rel = path.relative(dir, file).split(path.sep).join('/');
    const relLower = '/' + rel.toLowerCase();
    if (SKIP_PATH.some(p => relLower.includes(p))) continue;
    let raw;
    try { raw = fs.readFileSync(file, 'utf8'); } catch { continue; }
    if (raw.length > 400000) continue;
    const { data, body, hasFrontmatter } = parseSkillMarkdown(raw);
    const dirPath = path.posix.dirname(rel);
    const dirName = dirPath === '.' ? r.name : path.posix.basename(dirPath);
    let name = toStr(data.name) || firstHeading(body) || dirName;
    name = clip(name.replace(/\s+/g, ' '), 80);
    let description = toStr(data.description);
    if (!description) description = firstParagraph(body, 320);
    description = clip(description.replace(/\s+/g, ' '), 600);
    if (!hasFrontmatter && body.trim().length < 80) continue; // junk
    if (!description && body.trim().length < 120) continue;

    const meta = data.metadata && typeof data.metadata === 'object' ? data.metadata : {};
    const metaBits = [toStr(meta.category), toStr(meta.domain), toStr(meta.tags), toStr(data.tags), toStr(data.category), toStr(data.keywords)].filter(Boolean).join(' ');
    const parentHint = dirPath === '.' ? '' : dirPath.split('/').filter(seg => !/^(skills?|\.claude|src|lib|plugins?|packages?)$/i.test(seg)).join('/');
    const cat = categorize({ name, dir: dirName, description, meta: metaBits, pathHint: parentHint, repo: r.fullName });

    const id = slug(`${r.owner}-${r.name}-${dirPath === '.' ? 'root' : dirPath}`);
    const plugin = enclosingPlugin(dir, dirPath);
    let marketplacePlugin;
    if (facts.marketplace && plugin) {
      const mp = facts.marketplace.plugins.find(p => p.name === plugin.name || (p.source && plugin.path && p.source.replace(/^\.\//, '').replace(/\/$/, '') === plugin.path));
      if (mp) marketplacePlugin = mp.name;
    } else if (facts.marketplace && dirPath !== '.') {
      const mp = facts.marketplace.plugins.find(p => p.source && p.source.replace(/^\.\//, '').replace(/\/$/, '') && dirPath.startsWith(p.source.replace(/^\.\//, '').replace(/\/$/, '')));
      if (mp) marketplacePlugin = mp.name;
    }
    const branch = head.branch || 'main';
    const treeUrl = dirPath === '.' ? `https://github.com/${r.fullName}` : `https://github.com/${r.fullName}/tree/${branch}/${dirPath}`;
    skills.push({
      id,
      name,
      description,
      repo: r.fullName,
      path: dirPath === '.' ? '' : dirPath,
      file: rel,
      url: treeUrl,
      fileUrl: `https://github.com/${r.fullName}/blob/${branch}/${rel}`,
      rawUrl: `https://raw.githubusercontent.com/${r.fullName}/${branch}/${rel}`,
      category: cat.category,
      subcategory: cat.subcategory,
      alsoIn: cat.alsoIn,
      official: !!r.official,
      license: clip(toStr(data.license), 60) || undefined,
      version: clip(toStr(meta.version || data.version), 20) || undefined,
      author: clip(toStr(meta.author || data.author), 60) || undefined,
      tools: clip(toStr(data['allowed-tools'] || data.allowedTools), 200) || undefined,
      requires: data.requires && typeof data.requires === 'object' ? clip(JSON.stringify(data.requires), 200) : undefined,
      size: raw.length,
      hasScripts: hasDir(dirPath, 'scripts'),
      hasReferences: hasDir(dirPath, 'references') || hasDir(dirPath, 'reference'),
      hasAssets: hasDir(dirPath, 'assets'),
      plugin: plugin?.name || undefined,
      marketplacePlugin: marketplacePlugin || undefined,
      _score: cat.score,
    });
  }
  return skills;
}

function shardName(repo) { return repo.toLowerCase().replace(/[^a-z0-9]+/g, '_'); }
function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
}

// ---------------------------------------------------------------- main
async function main() {
  const t0 = Date.now();
  log(`collect: cache=${CACHE} out=${OUT} api=${USE_API} crawl=${USE_CRAWL} maxRepos=${MAX_REPOS}`);

  // 1. seeds
  for (const s of SOURCES.seeds) addRepo(s.repo, { kind: s.kind, official: !!s.official, via: 'seed' });

  // 1b. GitHub API discovery (optional)
  if (USE_API) {
    for (const topic of SOURCES.githubSearch.topics || []) {
      const found = await gh.searchReposByTopic(topic, SOURCES.githubSearch.maxReposPerQuery || 300);
      if (!found.length) { if (!gh.apiStatus().enabled) break; continue; }
      let n = 0;
      for (const f of found) { if (f.archived || f.fork) continue; if (addRepo(f.fullName, { via: `topic:${topic}` })) n++; }
      log(`topic:${topic} -> ${found.length} repos (${n} new)`);
    }
    for (const q of SOURCES.githubSearch.codeQueries || []) {
      if (!gh.apiStatus().enabled) break;
      const found = await gh.searchCode(q, SOURCES.githubSearch.maxReposPerQuery || 300);
      let n = 0;
      for (const f of found) { if (f.fork) continue; if (addRepo(f.fullName, { via: 'code-search' })) n++; }
      log(`code:"${q}" -> ${found.length} repos (${n} new)`);
    }
  }

  // 2. clone seeds first; crawl awesome lists for more repos
  const results = new Map(); // key -> {dir, head, skills, error}
  const processRepo = async (r) => {
    const key = r.fullName.toLowerCase();
    if (results.has(key)) return results.get(key);
    const res = { dir: null, head: null, skills: [], links: new Map(), error: null };
    results.set(key, res);
    try {
      res.dir = await cloneOrUpdate(r);
      res.head = await headInfo(res.dir);
      res.tree = await treePaths(res.dir);
      res.skills = extractSkills(r, res.dir, res.head, res.tree);
      if (r.kind === 'awesome' || r.kind === 'collection' || r.official) res.links = readmeLinks(res.dir);
      log(`✓ ${r.fullName}: ${res.skills.length} skills${res.links.size ? `, ${res.links.size} links` : ''}`);
    } catch (e) {
      res.error = String(e.message || e).split('\n')[0].slice(0, 200);
      log(`✗ ${r.fullName}: ${res.error}`);
    }
    return res;
  };

  const firstWave = [...repos.values()];
  await pool(firstWave, CONCURRENCY, processRepo);

  if (USE_CRAWL) {
    const discovered = new Map();
    for (const r of firstWave) {
      const res = results.get(r.fullName.toLowerCase());
      if (!res || !res.links) continue;
      for (const [fn] of res.links) {
        const key = fn.toLowerCase();
        if (repos.has(key)) continue;
        if (!discovered.has(key)) discovered.set(key, { fn, via: new Set() });
        discovered.get(key).via.add(r.fullName);
      }
    }
    // rank discovered repos by how many lists mention them, cap
    const ranked = [...discovered.values()].sort((a, b) => b.via.size - a.via.size);
    const budget = Math.max(0, Math.min(SOURCES.crawl.maxDiscoveredRepos, MAX_REPOS - repos.size));
    const wave2 = [];
    for (const d of ranked) {
      if (wave2.length >= budget) break;
      const r = addRepo(d.fn, { via: `awesome:${[...d.via][0]}` });
      if (r) wave2.push(r);
    }
    log(`crawl: ${discovered.size} linked repos found, cloning ${wave2.length} (budget ${budget})`);
    await pool(wave2, CONCURRENCY, processRepo);
  }

  // 3. repo metadata via API (optional, best effort)
  if (USE_API && gh.apiStatus().enabled) {
    const list = [...repos.values()];
    await pool(list, 4, async (r) => {
      const info = await gh.repoInfo(r.fullName);
      if (info && !info.notFound) r.info = info;
    });
    log(`repo metadata fetched for ${list.filter(r => r.info).length}/${list.length} repos`);
  }

  // 3b. the same repository under two names (renames / redirects) shares a HEAD commit: keep one
  const bySha = new Map();
  for (const r of repos.values()) {
    const res = results.get(r.fullName.toLowerCase());
    if (!res || res.error || !res.head?.sha || !res.skills.length) continue;
    const prev = bySha.get(res.head.sha);
    if (!prev) { bySha.set(res.head.sha, r); continue; }
    const score = x => (x.foundVia.has('seed') ? 10 : 0) + (x.official ? 5 : 0) + x.foundVia.size;
    const loser = score(r) > score(prev) ? prev : r;
    const winner = loser === r ? prev : r;
    bySha.set(res.head.sha, winner);
    results.get(loser.fullName.toLowerCase()).error = `duplicate of ${winner.fullName} (same HEAD)`;
    results.get(loser.fullName.toLowerCase()).skills = [];
    log(`= ${loser.fullName} is the same repository as ${winner.fullName}; skipped`);
  }

  // 4. merge + dedupe
  const all = [];
  for (const r of repos.values()) {
    const res = results.get(r.fullName.toLowerCase());
    if (!res || res.error) continue;
    for (const s of res.skills) all.push(s);
  }
  const byFp = new Map();
  for (const s of all) {
    const fp = createHash('sha1').update(norm(s.name) + '|' + norm(s.description).slice(0, 160)).digest('hex').slice(0, 12);
    const prev = byFp.get(fp);
    if (!prev) { byFp.set(fp, { ...s, copies: [] }); continue; }
    const keepNew = rank(s) > rank(prev);
    const winner = keepNew ? { ...s, copies: prev.copies } : prev;
    const loser = keepNew ? prev : s;
    if (!winner.copies.some(c => c.repo === loser.repo && c.path === loser.path)) winner.copies.push({ repo: loser.repo, path: loser.path, url: loser.url });
    byFp.set(fp, winner);
  }
  function rank(s) {
    const r = repos.get(s.repo.toLowerCase());
    let v = 0;
    if (s.official) v += 1000;
    if (AGGREGATORS.has(s.repo.toLowerCase())) v -= 500;
    v += Math.log10((r?.info?.stars || 0) + 1) * 10;
    v -= s.path.split('/').length; // shallower path = more canonical
    return v;
  }
  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }

  // ensure unique ids
  const seenIds = new Map();
  const skills = [...byFp.values()].map(s => {
    let id = s.id; let n = 1;
    while (seenIds.has(id)) id = `${s.id}-${++n}`;
    seenIds.set(id, true);
    const r = repos.get(s.repo.toLowerCase());
    const stars = r?.info?.stars ?? null;
    const { _score, ...rest } = s;
    return { ...rest, id, stars };
  });
  skills.sort((a, b) => (b.official - a.official) || ((b.stars || 0) - (a.stars || 0)) || a.name.localeCompare(b.name));

  // 5. output
  const repoOut = {};
  for (const r of repos.values()) {
    const res = results.get(r.fullName.toLowerCase());
    const count = skills.filter(s => s.repo === r.fullName).length;
    if (!res || (res.error && !count)) continue;
    if (!count && r.kind === 'discovered') continue;
    repoOut[r.fullName] = {
      owner: r.owner, name: r.name, url: `https://github.com/${r.fullName}`, kind: r.kind, official: !!r.official,
      skills: count, stars: r.info?.stars ?? null, description: clip(r.info?.description || '', 240) || undefined,
      license: r.info?.license || undefined, pushedAt: r.info?.pushedAt || res.head?.date || undefined,
      branch: res.head?.branch || r.info?.defaultBranch || 'main', topics: r.info?.topics?.slice(0, 10) || undefined,
      foundVia: [...r.foundVia].slice(0, 5),
      marketplace: r.facts?.marketplace ? { name: r.facts.marketplace.name, plugins: r.facts.marketplace.plugins.length } : undefined,
    };
  }
  const tree = categoryTree();
  const counts = {};
  for (const s of skills) {
    counts[s.category] = (counts[s.category] || 0) + 1;
    counts[`${s.category}/${s.subcategory}`] = (counts[`${s.category}/${s.subcategory}`] || 0) + 1;
  }
  for (const c of tree) { c.count = counts[c.id] || 0; for (const sc of c.subcategories) sc.count = counts[`${c.id}/${sc.id}`] || 0; }

  const errors = [...repos.values()].map(r => [r.fullName, results.get(r.fullName.toLowerCase())?.error]).filter(([, e]) => e).map(([fullName, error]) => ({ repo: fullName, error }));
  // Compact row format keeps the index JSON small enough for the browser (URLs are derived client-side from
  // repo+path+branch). Full details (long description, copies, tools, ...) live in per-repo shards under data/repos/.
  const cols = ['id', 'name', 'description', 'repo', 'path', 'category', 'subcategory', 'alsoIn', 'official', 'license', 'version', 'stars', 'flags', 'plugin', 'marketplacePlugin', 'copies', 'file'];
  const rows = skills.map(s => {
    const flags = (s.hasScripts ? 1 : 0) | (s.hasReferences ? 2 : 0) | (s.hasAssets ? 4 : 0);
    const stdFile = (s.path ? s.path + '/' : '') + 'SKILL.md';
    return [s.id, s.name, clip(s.description, 200), s.repo, s.path, s.category, s.subcategory, s.alsoIn.length ? s.alsoIn : 0, s.official ? 1 : 0, s.license || 0, s.version || 0, s.stars ?? 0, flags, s.plugin || 0, s.marketplacePlugin || 0, s.copies.length, s.file === stdFile ? 0 : s.file];
  });
  const shardDir = path.join(path.dirname(OUT), 'repos');
  fs.rmSync(shardDir, { recursive: true, force: true });
  fs.mkdirSync(shardDir, { recursive: true });
  const shards = {};
  for (const s of skills) {
    const key = shardName(s.repo);
    (shards[key] ||= { repo: s.repo, skills: {} }).skills[s.id] = {
      description: clip(s.description, 1200), author: s.author, tools: s.tools, requires: s.requires, size: s.size,
      copies: s.copies.slice(0, 50).map(c => c.repo + (c.path ? '/' + c.path : '')),
    };
  }
  for (const [key, shard] of Object.entries(shards)) fs.writeFileSync(path.join(shardDir, key + '.json'), JSON.stringify(shard));
  const out = {
    generatedAt: new Date().toISOString(),
    format: 'rows-v1',
    cols,
    stats: { skills: skills.length, repos: Object.keys(repoOut).length, reposScanned: results.size, reposFailed: errors.length, official: skills.filter(s => s.official).length, duplicatesMerged: all.length - skills.length, durationSec: Math.round((Date.now() - t0) / 1000), apiUsed: gh.apiStatus().enabled && USE_API },
    categories: tree,
    repos: repoOut,
    skills: rows,
  };
  fs.writeFileSync(OUT, JSON.stringify(out));
  fs.writeFileSync(path.join(path.dirname(OUT), 'stats.json'), JSON.stringify({ generatedAt: out.generatedAt, ...out.stats, errors: errors.slice(0, 100), api: gh.apiStatus() }, null, 2));
  log(`done: ${skills.length} skills from ${Object.keys(repoOut).length} repos (${all.length - skills.length} duplicates merged, ${errors.length} repo errors) in ${out.stats.durationSec}s -> ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
}

async function pool(items, n, fn) {
  const q = [...items];
  const workers = Array.from({ length: Math.min(n, q.length) }, async () => { while (q.length) await fn(q.shift()); });
  await Promise.all(workers);
}
function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2);
    const eq = k.indexOf('=');
    if (eq >= 0) o[k.slice(0, eq)] = k.slice(eq + 1);
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) o[k] = argv[++i];
    else o[k] = true;
  }
  return o;
}

main().catch(e => { console.error(e); process.exit(1); });
