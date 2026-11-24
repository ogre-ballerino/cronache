#!/usr/bin/env node
// Saves a character's sheet for the site from a Foundry VTT dnd5e actor
// export: one compact JSON per level, in sites/<site>/src/schede/<id>/.
// Re-running at the same level overwrites that level's snapshot.
// Usage: pnpm scheda <fvtt-Actor-….json> <site> <character id> [--sessione N] [--data YYYY-MM-DD]

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fromFoundry } from '../packages/core/lib/scheda/foundry.mjs';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { sessione: { type: 'string' }, data: { type: 'string' } },
});
const [exportFile, site, character] = positionals;
if (!exportFile || !site || !character) {
  console.error('Usage: pnpm scheda <fvtt-Actor-….json> <site> <character id> [--sessione N] [--data YYYY-MM-DD]');
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, '..');
const siteDir = path.join(root, 'sites', site);
const characterFile = path.join(siteDir, 'src/content/personaggi', `${character}.md`);
if (!fs.existsSync(characterFile)) {
  console.error(`No character "${character}" in ${path.relative(root, path.dirname(characterFile))}/`);
  process.exit(1);
}

const actor = JSON.parse(fs.readFileSync(path.resolve(exportFile), 'utf8'));
if (actor.type !== 'character' || actor._stats?.systemId !== 'dnd5e') {
  console.error('Not a dnd5e character export (expected type "character" and system "dnd5e").');
  process.exit(1);
}

const sheet = fromFoundry(actor, {
  data: values.data ?? new Date().toISOString().slice(0, 10),
  sessione: values.sessione ? Number(values.sessione) : undefined,
});
const outFile = path.join(siteDir, 'src/schede', character, `livello-${String(sheet.livello).padStart(2, '0')}.json`);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(sheet, null, 2)}\n`);
console.log(`${path.relative(root, outFile)}: level ${sheet.livello}, ${sheet.pf} HP, AC ${sheet.ca}`);
