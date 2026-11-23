import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS, entryUrl } from './collections.mjs';

export const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

// Range of Unicode combining diacritical marks (U+0300-U+036F), built from
// code points rather than a literal character class to avoid encoding issues.
const DIACRITICS_RE = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  'g'
);

// Astro's default markdown processor runs remark-smartypants, which turns
// straight apostrophes/quotes into their curly typographic equivalents in
// rendered text nodes. The slug map, however, is built from a raw read of
// the source files (still straight quotes). Stripping every apostrophe
// variant before comparing keeps both sides matching regardless of which
// form a given piece of text went through.
const APOSTROPHE_RE = new RegExp(
  `['${String.fromCharCode(0x2018)}${String.fromCharCode(0x2019)}]`,
  'g'
);

export function normalize(str) {
  return str
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .replace(APOSTROPHE_RE, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// Frontmatter doesn't go through remark-smartypants, and some display fonts
// (IM Fell) draw a straight " as a closing quote.
export const curlyQuotes = (s) => s.replace(/"([^"]*)"/g, '“$1”');

export function frontmatterField(raw, key) {
  const m = raw.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return m?.[1].trim().replace(/^(["'])(.*)\1$/, '$2');
}

export const markdownBody = (raw) => raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');

// Top-level .md files only, drafts (`_`) excluded: the same set the content
// collections load.
export function* contentFiles(contentDir) {
  for (const { key } of COLLECTIONS) {
    const dir = path.join(contentDir, key);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).sort()) {
      if (!file.endsWith('.md') || file.startsWith('_')) continue;
      const filePath = path.join(dir, file);
      yield { collection: key, id: file.replace(/\.md$/, ''), path: filePath, raw: fs.readFileSync(filePath, 'utf-8') };
    }
  }
}

const caches = new Map();

export function getSlugMap(contentDir) {
  const cached = caches.get(contentDir);
  if (cached) return cached;

  const map = new Map();
  const add = (key, entry) => {
    const existing = map.get(key);
    if (existing && existing.url !== entry.url) {
      console.warn(`[wikilinks] "${key}" names both ${existing.url} and ${entry.url}: links go to ${entry.url}`);
    }
    map.set(key, entry);
  };

  for (const { collection, id, raw } of contentFiles(contentDir)) {
    const title = frontmatterField(raw, 'titolo') ?? id;
    const entry = {
      url: entryUrl(collection, id),
      title,
      collection,
      ruolo: frontmatterField(raw, 'ruolo'),
      stato: frontmatterField(raw, 'stato'),
      tipo: frontmatterField(raw, 'tipo'),
    };
    add(normalize(id), entry);
    add(normalize(title), entry);
  }
  caches.set(contentDir, map);
  return map;
}

/** Every `[[target]]` in a content body that matches no entry. */
export function findUnresolvedLinks(contentDir) {
  const slugMap = getSlugMap(contentDir);
  const unresolved = [];
  for (const file of contentFiles(contentDir)) {
    for (const [, target] of markdownBody(file.raw).matchAll(WIKILINK_RE)) {
      if (!slugMap.has(normalize(target))) unresolved.push({ file: file.path, target });
    }
  }
  return unresolved;
}
