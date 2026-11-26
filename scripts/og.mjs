#!/usr/bin/env node
// Renders a session's woodcut, sites/<site>/og/<name>.html, with headless Chrome into
// sites/<site>/public/images/sessioni/:
// - <name>.png, the 1200×630 link-preview card (set it as the session's `anteprima`);
// - <name>-arte.webp, the 1200×450 frontispiece without text, opened with ?arte, which
//   the session page shows automatically.
// A woodcut has only ink, paper, the rubric and their edges: reduced to a 12-colour
// palette it looks the same at a quarter of a JPEG's weight (fewer colours turn the
// rubric brown). Needs Google Chrome, ImageMagick and cwebp.
// Usage: pnpm og sites/strahd/og/sessione-16.html [more.html …]

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: pnpm og sites/<site>/og/<name>.html [more.html …]');
  process.exit(1);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'));

function screenshot(url, height, png) {
  // file:// pages need --allow-file-access-from-files to load the site's fonts from node_modules.
  execFileSync(CHROME, [
    '--headless=new',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    '--force-device-scale-factor=1',
    '--virtual-time-budget=5000',
    `--window-size=1200,${height}`,
    `--screenshot=${png}`,
    url,
  ], { stdio: 'ignore' });
}

function quantize(png, out) {
  execFileSync('magick', [png, '-dither', 'None', '-colors', '12', `PNG8:${out}`], { stdio: 'ignore' });
}

for (const file of files) {
  const html = path.resolve(file);
  const match = path.relative(process.cwd(), html).match(/^sites\/([^/]+)\/og\/([^/]+)\.html$/);
  if (!match) {
    console.error(`Expected sites/<site>/og/<name>.html, got ${file}`);
    process.exit(1);
  }
  const [, site, name] = match;
  const dir = path.join('sites', site, 'public/images/sessioni');
  fs.mkdirSync(dir, { recursive: true });
  const url = pathToFileURL(html).href;

  const card = path.join(dir, `${name}.png`);
  screenshot(url, 630, path.join(tmp, 'card.png'));
  quantize(path.join(tmp, 'card.png'), card);

  const arte = path.join(dir, `${name}-arte.webp`);
  screenshot(`${url}?arte`, 450, path.join(tmp, 'arte.png'));
  quantize(path.join(tmp, 'arte.png'), path.join(tmp, 'arte-12.png'));
  execFileSync('cwebp', ['-lossless', '-z', '9', path.join(tmp, 'arte-12.png'), '-o', arte], { stdio: 'ignore' });

  console.log(card);
  console.log(arte);
}
fs.rmSync(tmp, { recursive: true, force: true });
