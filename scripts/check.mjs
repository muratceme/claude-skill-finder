// Sanity checks for generated data, run in CI before committing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'site', 'data', 'skills.json');
const d = JSON.parse(fs.readFileSync(file, 'utf8'));
const problems = [];
if (d.format !== 'rows-v1') problems.push('unexpected format ' + d.format);
if (!Array.isArray(d.skills) || d.skills.length < 500) problems.push(`too few skills: ${d.skills?.length}`);
if (!d.repos || Object.keys(d.repos).length < 10) problems.push('too few repos');
const idIdx = d.cols.indexOf('id'), nameIdx = d.cols.indexOf('name'), repoIdx = d.cols.indexOf('repo');
const ids = new Set();
for (const r of d.skills) {
  if (ids.has(r[idIdx])) problems.push('duplicate id ' + r[idIdx]);
  ids.add(r[idIdx]);
  if (!r[nameIdx]) problems.push('empty name for ' + r[idIdx]);
  if (!d.repos[r[repoIdx]]) problems.push('unknown repo ' + r[repoIdx]);
  if (problems.length > 20) break;
}
const shardDir = path.join(root, 'site', 'data', 'repos');
if (!fs.existsSync(shardDir) || fs.readdirSync(shardDir).length < 10) problems.push('missing repo shards');
const size = fs.statSync(file).size;
if (size > 40 * 1024 * 1024) problems.push(`skills.json too large: ${size} bytes`);
if (problems.length) { console.error('check failed:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log(`check ok: ${d.skills.length} skills, ${Object.keys(d.repos).length} repos, ${(size / 1024 / 1024).toFixed(1)} MB`);
