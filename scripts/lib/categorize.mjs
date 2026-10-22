import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const taxonomy = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'taxonomy.json'), 'utf8'));

// Build compiled matchers once.
const STRONG = 3;
const NORMAL = 1;

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function compile(keyword) {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return null;
  // whole-word/phrase boundaries that also work for tokens like c++, c#, .net, next.js
  const re = new RegExp('(?<![a-z0-9])' + escapeRe(kw).replace(/\s+/g, '[\\s-]+') + '(?![a-z0-9+#])', 'g');
  const words = kw.split(/\s+/).length;
  return { kw, re, bonus: words > 1 ? 1 : 0 };
}

const subs = [];
for (const cat of taxonomy.categories) {
  for (const sub of cat.subcategories) {
    subs.push({
      cat, sub,
      matchers: [
        ...(sub.strong || []).map(compile).filter(Boolean).map(m => ({ ...m, w: STRONG })),
        ...(sub.keywords || []).map(compile).filter(Boolean).map(m => ({ ...m, w: NORMAL })),
      ],
    });
  }
}
const catMatchers = new Map(taxonomy.categories.map(c => [c.id, (c.keywords || []).map(compile).filter(Boolean)]));

/**
 * fields: { name, dir, description, meta, pathHint, repo }
 * returns { category, subcategory, score, alsoIn: [subIds], debug }
 */
export function categorize(fields) {
  const F = [
    ['name', 4.0, (fields.name || '')],
    ['dir', 3.0, (fields.dir || '').replace(/[-_]/g, ' ')],
    ['meta', 3.0, (fields.meta || '')],
    ['description', 1.5, (fields.description || '')],
    ['pathHint', 1.5, (fields.pathHint || '').replace(/[-_/]/g, ' ')],
    ['repo', 0.6, (fields.repo || '').replace(/[-_/]/g, ' ')],
  ].map(([k, w, t]) => [k, w, ' ' + t.toLowerCase() + ' ']);

  // Hard rules first
  const lowerPath = (fields.pathHint || '').toLowerCase();
  const lowerName = (fields.name || '').toLowerCase();
  if (/(^|\/)templates?(\/|$)/.test(lowerPath) || /^(template|template-skill|skill-template|example-skill)$/.test(lowerName)) {
    return { category: 'other', subcategory: 'templates-examples', score: 99, alsoIn: [] };
  }

  const scores = [];
  for (const s of subs) {
    let score = 0;
    const hits = [];
    for (const m of s.matchers) {
      let fieldHits = 0;
      for (const [fk, fw, text] of F) {
        m.re.lastIndex = 0;
        if (m.re.test(text)) {
          fieldHits++;
          score += (m.w + m.bonus) * fw;
          if (fieldHits >= 2) break; // cap per keyword
        }
      }
      if (fieldHits) hits.push(m.kw);
    }
    // small bump from category-level words
    let catBump = 0;
    for (const m of catMatchers.get(s.cat.id) || []) {
      for (const [, fw, text] of F) { m.re.lastIndex = 0; if (m.re.test(text)) { catBump += 0.5 * fw; break; } }
    }
    score += Math.min(catBump, 4);
    if (score > 0) scores.push({ cat: s.cat.id, sub: s.sub.id, score, hits });
  }
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  if (!best || best.score < 3) {
    return { category: 'other', subcategory: 'misc', score: best ? best.score : 0, alsoIn: [] };
  }
  const alsoIn = scores.slice(1)
    .filter(s => s.score >= Math.max(4, best.score * 0.6))
    .slice(0, 3)
    .map(s => s.sub);
  return { category: best.cat, subcategory: best.sub, score: Math.round(best.score * 10) / 10, alsoIn, hits: best.hits.slice(0, 8) };
}

export function categoryTree() {
  return taxonomy.categories.map(c => ({
    id: c.id, name: c.name, icon: c.icon,
    subcategories: c.subcategories.map(s => ({ id: s.id, name: s.name })),
  }));
}
