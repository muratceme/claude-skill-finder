import YAML from 'yaml';

/**
 * Parse a SKILL.md file: YAML frontmatter + markdown body.
 * Tolerant: returns {data:{}, body} when frontmatter is missing or invalid,
 * with a best-effort regex fallback for `name:` / `description:` lines.
 */
export function parseSkillMarkdown(raw) {
  const text = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const m = text.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (!m) return { data: {}, body: text, hasFrontmatter: false };
  const fm = m[1];
  const body = text.slice(m[0].length);
  let data = {};
  try {
    const parsed = YAML.parse(fm, { strict: false, uniqueKeys: false });
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed;
  } catch {
    data = fallbackParse(fm);
  }
  if (!data.name && !data.description) {
    const fb = fallbackParse(fm);
    data = { ...fb, ...data };
  }
  return { data, body, hasFrontmatter: true };
}

function fallbackParse(fm) {
  const out = {};
  const lines = fm.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const mm = lines[i].match(/^([A-Za-z_][\w-]*):[ \t]*(.*)$/);
    if (!mm) continue;
    const key = mm[1];
    let val = mm[2].trim();
    if (val === '|' || val === '>' || val === '|-' || val === '>-') {
      const buf = [];
      while (i + 1 < lines.length && (/^\s+/.test(lines[i + 1]) || lines[i + 1].trim() === '')) {
        buf.push(lines[++i].trim());
      }
      val = buf.join(val.startsWith('|') ? '\n' : ' ').trim();
    }
    val = val.replace(/^["']|["']$/g, '');
    if (val) out[key] = val;
  }
  return out;
}

/** First meaningful paragraph of a markdown body, for descriptions. */
export function firstParagraph(body, max = 320) {
  const lines = body.split('\n');
  const buf = [];
  let started = false;
  for (const line of lines) {
    const t = line.trim();
    if (!t) { if (started) break; else continue; }
    if (/^(#|!\[|\||```|<|---|\*\*?note|>)/i.test(t)) { if (started) break; else continue; }
    started = true;
    buf.push(t);
    if (buf.join(' ').length > max) break;
  }
  return clip(buf.join(' ').replace(/\s+/g, ' '), max);
}

export function firstHeading(body) {
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].replace(/[`*_]/g, '').trim() : '';
}

export function clip(s, max) {
  if (!s) return '';
  s = String(s).trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const i = cut.lastIndexOf(' ');
  return (i > max * 0.6 ? cut.slice(0, i) : cut).trim() + '…';
}

export function toStr(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v)) return v.map(toStr).filter(Boolean).join(', ');
  if (typeof v === 'object') return '';
  return String(v).trim();
}
