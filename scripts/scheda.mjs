#!/usr/bin/env node
// Saves a character's sheet snapshot for a site with `features.schede`, in
// sites/<site>/src/schede/<id>/, from:
// - dnd5e: a Foundry VTT dnd5e actor export (fvtt-Actor-….json), one file per level;
// - coc7e: a filled Chaosium "1920s Era Investigator" PDF, one file per chapter (--sessione required).
// Re-running for the same level or chapter overwrites that snapshot. The date
// defaults to the session's, or today.
// Usage: pnpm scheda <export.json | sheet.pdf> <site> <character id> [--sessione N] [--data YYYY-MM-DD]

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { fromFoundry } from '../packages/core/lib/scheda/dnd5e/foundry.mjs';
import { readChaosiumPdf } from '../packages/core/lib/scheda/coc7e/read.mjs';

const usage = 'Usage: pnpm scheda <export.json | sheet.pdf> <site> <character id> [--sessione N] [--data YYYY-MM-DD]';
const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { sessione: { type: 'string' }, data: { type: 'string' } },
});
const [inputFile, site, character] = positionals;
if (!inputFile || !site || !character) fail(usage);

const root = path.resolve(import.meta.dirname, '..');
const siteDir = path.join(root, 'sites', site);
const contentDir = path.join(siteDir, 'src/content');
if (!fs.existsSync(path.join(contentDir, 'personaggi', `${character}.md`))) {
  fail(`No character "${character}" in sites/${site}/src/content/personaggi/`);
}
const { default: config } = await import(pathToFileURL(path.join(siteDir, 'campaign.config.mjs')).href);
const system = config.features?.schede;
const sessione = values.sessione ? Number(values.sessione) : undefined;
const data = values.data ?? sessionDate(sessione) ?? new Date().toISOString().slice(0, 10);
const input = fs.readFileSync(path.resolve(inputFile));

let sheet;
let slug;
if (system === 'dnd5e') {
  const actor = JSON.parse(input.toString('utf8'));
  if (actor.type !== 'character' || actor._stats?.systemId !== 'dnd5e') fail('Not a dnd5e character export (expected type "character" and system "dnd5e").');
  sheet = fromFoundry(actor, { data, sessione });
  slug = `livello-${String(sheet.livello).padStart(2, '0')}`;
} else if (system === 'coc7e') {
  if (!sessione) fail('A coc7e snapshot follows a chapter: pass --sessione N.');
  sheet = await readChaosiumPdf(input, { capitolo: sessione, data });
  slug = `capitolo-${String(sessione).padStart(2, '0')}`;
} else {
  fail(`sites/${site} has no character sheets (features.schede is ${JSON.stringify(system)}).`);
}

const outFile = path.join(siteDir, 'src/schede', character, `${slug}.json`);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(sheet, null, 2)}\n`);
console.log(`${path.relative(root, outFile)} written`);

function sessionDate(numero) {
  if (!numero) return undefined;
  const dir = path.join(contentDir, 'sessions');
  for (const file of fs.readdirSync(dir)) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    if (new RegExp(`^numero:\\s*${numero}\\s*$`, 'm').test(text)) return text.match(/^data:\s*(\S+)/m)?.[1];
  }
  return undefined;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
