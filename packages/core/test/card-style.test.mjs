import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { cardStyle, fontFaces, resolveToken, rootTokens } from '../lib/card-style.mjs';

const tmp = (name, text) => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cronache-card-')), name);
  fs.writeFileSync(file, text);
  return file;
};

describe('rootTokens', () => {
  it('reads :root rules as the cascade settles them, skipping @media and other selectors', () => {
    const css = `
      @import url(x.css);
      /* :root { --color-bg: comment; } */
      :root { --color-bg: #fff; --color-ink: #000; }
      :root, .map { --color-ink: #111; }
      @media (prefers-color-scheme: dark) { :root { --color-bg: #000; } }
      .paper { --color-bg: #eee; }
    `;
    assert.deepEqual(rootTokens(css), { 'color-bg': '#fff', 'color-ink': '#111' });
  });

  it('follows var() references', () => {
    const tokens = rootTokens(':root { --paper: #eee; --color-bg: var(--paper); }');
    assert.equal(resolveToken(tokens, 'color-bg'), '#eee');
  });
});

describe('fontFaces', () => {
  it('keeps the latin subsets, plain latin first, with their woff files', () => {
    const face = (subset, style) => `/* f-${subset}-400-${style} */
@font-face {
  font-family: 'F';
  font-style: ${style};
  font-weight: 400;
  src: url(./files/f-${subset}-400-${style}.woff2) format('woff2'), url(./files/f-${subset}-400-${style}.woff) format('woff');
}`;
    const file = tmp('400.css', ['cyrillic', 'latin-ext', 'latin'].map((s) => face(s, 'normal')).join('\n'));
    assert.deepEqual(
      fontFaces(file).map((f) => path.basename(f.file)),
      ['f-latin-400-normal.woff', 'f-latin-ext-400-normal.woff']
    );
    assert.deepEqual(fontFaces(file)[0], {
      name: 'F',
      style: 'normal',
      weight: 400,
      file: path.join(path.dirname(file), 'files/f-latin-400-normal.woff'),
    });
  });
});

describe('cardStyle', () => {
  it('prefers the --card-* tokens, falling back to the page ones', () => {
    const theme = tmp(
      'theme.css',
      `:root {
        --color-bg: #000; --color-ink: #eee; --color-ink-muted: #999; --color-rubric: gold; --color-rule: #333;
        --paper: #ddd; --card-bg: var(--paper);
        --font-display: 'Garamond', serif; --font-body: 'Body', serif; --font-card-title: 'Fraktur', serif;
      }`
    );
    const style = cardStyle({ fonts: [], themes: [theme] });
    assert.deepEqual(style.colors, { bg: '#ddd', ink: '#eee', 'ink-muted': '#999', rubric: 'gold', rule: '#333' });
    assert.deepEqual([style.title, style.label, style.body], ['Fraktur', 'Garamond', 'Body']);
  });
});
