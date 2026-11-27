import fs from 'node:fs';
import path from 'node:path';

// The link-preview cards are drawn from the site's own design tokens, so every
// site gets cards in its own colours and fonts without configuring anything.
// A theme whose pages differ from its woodcuts' cartouche sets `--card-<colour>`,
// `--font-card-title` and `--font-card-label` so the two read alike.

const COLORS = ['bg', 'ink', 'ink-muted', 'rubric', 'rule'];
const SUBSETS = /latin(-ext)?-\d+-(normal|italic)/;

// Custom properties declared in top-level `:root` rules, as the cascade would
// settle them; anything inside @media (dark mode) is skipped.
export function rootTokens(css) {
  const tokens = {};
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let depth = 0;
  let selector = '';
  let body = '';
  for (const char of source) {
    if (char === '{') {
      depth++;
      if (depth === 1) body = '';
      continue;
    }
    if (char === '}') {
      depth--;
      if (depth === 0) {
        // Drop statements such as @import that end before the rule.
        selector = selector.slice(selector.lastIndexOf(';') + 1).trim();
        if (!selector.startsWith('@') && selector.split(',').some((s) => s.trim() === ':root')) {
          for (const [, name, value] of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);?/g)) {
            tokens[name] = value.trim();
          }
        }
        selector = '';
      }
      continue;
    }
    if (depth === 0) selector += char;
    else if (depth === 1) body += char;
  }
  return tokens;
}

export function resolveToken(tokens, name) {
  let value = tokens[name];
  for (let i = 0; value?.startsWith('var(') && i < 10; i++) {
    value = tokens[value.match(/var\(--([\w-]+)/)?.[1]];
  }
  return value;
}

const firstFamily = (stack) => stack?.split(',')[0].trim().replace(/^['"]|['"]$/g, '');

// The latin @font-face rules of a Fontsource stylesheet, with their .woff file
// (satori reads woff, not woff2). Plain latin first: satori draws with the
// first face of a family and only falls back to latin-ext for other glyphs.
export function fontFaces(cssFile) {
  const css = fs.readFileSync(cssFile, 'utf8');
  return [...css.matchAll(/\/\* ([\w-]+) \*\/\s*@font-face\s*{([^}]*)}/g)]
    .filter(([, subset]) => SUBSETS.test(subset))
    .map(([, subset, body]) => ({
      name: body.match(/font-family:\s*'([^']+)'/)[1],
      style: body.match(/font-style:\s*(\w+)/)[1],
      weight: Number(body.match(/font-weight:\s*(\d+)/)[1]),
      file: path.resolve(path.dirname(cssFile), body.match(/url\(([^)]+\.woff)\)/)[1]),
      ext: subset.includes('latin-ext'),
    }))
    .sort((a, b) => a.ext - b.ext)
    .map(({ ext, ...face }) => face);
}

/**
 * @param {{ fonts: string[], themes: string[] }} css Resolved Fontsource stylesheets and the site's own.
 */
export function cardStyle({ fonts, themes }) {
  const tokens = Object.assign({}, ...themes.map((file) => rootTokens(fs.readFileSync(file, 'utf8'))));
  const token = (card, page) => resolveToken(tokens, card) ?? resolveToken(tokens, page);
  const colors = Object.fromEntries(COLORS.map((name) => [name, token(`card-${name}`, `color-${name}`)]));
  const missing = COLORS.filter((name) => !colors[name]);
  if (missing.length) throw new Error(`[cards] The theme defines no --color-${missing.join(', --color-')} in :root`);
  return {
    colors,
    title: firstFamily(token('font-card-title', 'font-display')),
    label: firstFamily(token('font-card-label', 'font-display')),
    body: firstFamily(resolveToken(tokens, 'font-body')),
    fonts: fonts.flatMap(fontFaces),
  };
}
