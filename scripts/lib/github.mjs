/**
 * Optional GitHub REST helpers. Everything here degrades gracefully: when no
 * token is present or the API is unreachable (403/401/network), callers get
 * null / [] and the collector continues with git-only discovery.
 */
const API = 'https://api.github.com';
let disabled = false;
let disabledReason = '';

function headers() {
  const h = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'claude-skill-finder', 'X-GitHub-Api-Version': '2022-11-28' };
  const tok = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (tok) h['Authorization'] = `Bearer ${tok}`;
  return h;
}

async function get(pathname, { retries = 2 } = {}) {
  if (disabled) return null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    let res;
    try {
      res = await fetch(API + pathname, { headers: headers() });
    } catch (e) {
      if (attempt === retries) { disable(`network error: ${e.message}`); return null; }
      await sleep(1500 * (attempt + 1));
      continue;
    }
    if (res.status === 401 || res.status === 403) {
      const remaining = res.headers.get('x-ratelimit-remaining');
      const reset = Number(res.headers.get('x-ratelimit-reset') || 0) * 1000;
      if (remaining === '0' && reset && reset - Date.now() < 120000 && attempt < retries) {
        await sleep(reset - Date.now() + 1000); continue;
      }
      if (res.status === 403 && (res.headers.get('retry-after') || remaining !== '0') && attempt < retries) {
        // secondary rate limit or search throttle
        await sleep(Number(res.headers.get('retry-after') || 20) * 1000); continue;
      }
      disable(`HTTP ${res.status} on ${pathname}`);
      return null;
    }
    if (res.status === 404) return { notFound: true };
    if (!res.ok) { if (attempt < retries) { await sleep(2000); continue; } return null; }
    return res.json();
  }
  return null;
}

function disable(reason) { if (!disabled) { disabled = true; disabledReason = reason; console.warn(`[github] API disabled for this run: ${reason}`); } }
const sleep = ms => new Promise(r => setTimeout(r, ms));

export function apiStatus() { return { enabled: !disabled, reason: disabledReason, hasToken: !!(process.env.GITHUB_TOKEN || process.env.GH_TOKEN) }; }

export async function repoInfo(fullName) {
  const j = await get(`/repos/${fullName}`);
  if (!j || j.notFound) return j;
  return {
    fullName: j.full_name, description: j.description || '', stars: j.stargazers_count || 0, forks: j.forks_count || 0,
    license: j.license?.spdx_id && j.license.spdx_id !== 'NOASSERTION' ? j.license.spdx_id : (j.license?.name || ''),
    pushedAt: j.pushed_at, archived: !!j.archived, fork: !!j.fork, defaultBranch: j.default_branch || 'main', topics: j.topics || [], homepage: j.homepage || '',
  };
}

export async function searchReposByTopic(topic, max = 300) {
  const out = [];
  for (let page = 1; out.length < max && page <= 10; page++) {
    const j = await get(`/search/repositories?q=${encodeURIComponent('topic:' + topic)}&sort=stars&order=desc&per_page=100&page=${page}`);
    if (!j || !j.items) break;
    for (const r of j.items) out.push({ fullName: r.full_name, stars: r.stargazers_count, archived: r.archived, fork: r.fork, defaultBranch: r.default_branch });
    if (j.items.length < 100) break;
    await sleep(2500); // search API: 30 req/min
  }
  return out;
}

export async function searchCode(query, max = 300) {
  const out = new Map();
  for (let page = 1; out.size < max && page <= 10; page++) {
    const j = await get(`/search/code?q=${encodeURIComponent(query)}&per_page=100&page=${page}`);
    if (!j || !j.items) break;
    for (const it of j.items) {
      const fn = it.repository?.full_name; if (!fn) continue;
      if (!out.has(fn)) out.set(fn, { fullName: fn, fork: it.repository.fork, hintPath: it.path });
    }
    if (j.items.length < 100) break;
    await sleep(7000); // code search: ~10 req/min
  }
  return [...out.values()];
}
