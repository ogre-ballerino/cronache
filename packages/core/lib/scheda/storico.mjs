// What changed on a character sheet between two levels, as short Italian
// lines grouped by heading, for the history under the sheet.

import { ABILITIES, SKILLS } from './labels.mjs';

const names = (list) => new Set(list.map((x) => x.nome));

function added(prev, next) {
  const before = names(prev);
  return [...new Set(next.map((x) => x.nome))].filter((n) => !before.has(n));
}

const sign = (n) => (n >= 0 ? `+${n}` : `${n}`);

function numbers(prev, next) {
  const lines = [];
  const change = (label, a, b, format = String) => {
    if (a !== b) lines.push(`${label}: ${format(a)} → ${format(b)}`);
  };
  change('Hit Points', prev.pf, next.pf);
  change('Armor Class', prev.ca, next.ca);
  change('Proficiency Bonus', prev.competenza, next.competenza, sign);
  for (const [key, abbr] of Object.entries(ABILITIES)) {
    change(abbr, prev.caratteristiche[key].valore, next.caratteristiche[key].valore);
  }
  const cd = [prev.incantesimi?.cd, next.incantesimi?.cd];
  if (cd[0] && cd[1]) change('Spell save DC', cd[0], cd[1]);
  return lines;
}

function skills(prev, next) {
  return Object.entries(SKILLS)
    .filter(([key]) => next.abilita[key].competenza > prev.abilita[key].competenza)
    .map(([key, [label]]) => (next.abilita[key].competenza >= 2 ? `${label} (expertise)` : label));
}

function proficiencies(prev, next) {
  return Object.keys(next.competenze).flatMap((key) => {
    const before = new Set(prev.competenze[key]);
    return next.competenze[key].filter((x) => !before.has(x));
  });
}

/**
 * @returns {{ titolo: string, voci: string[] }[]} only the non-empty groups
 */
export function diffSheets(prev, next) {
  const spells = (s) => s.incantesimi?.elenco ?? [];
  const groups = [
    { titolo: 'Valori', voci: numbers(prev, next) },
    { titolo: 'Nuovi privilegi', voci: added(prev.privilegi, next.privilegi) },
    { titolo: 'Privilegi rimossi', voci: added(next.privilegi, prev.privilegi) },
    { titolo: 'Nuovi incantesimi', voci: added(spells(prev), spells(next)) },
    { titolo: 'Incantesimi rimossi', voci: added(spells(next), spells(prev)) },
    { titolo: 'Nuove abilità', voci: skills(prev, next) },
    { titolo: 'Nuove competenze', voci: proficiencies(prev, next) },
    { titolo: 'Oggetti nuovi', voci: added(prev.equipaggiamento, next.equipaggiamento) },
    { titolo: 'Oggetti persi', voci: added(next.equipaggiamento, prev.equipaggiamento) },
  ];
  return groups.filter((g) => g.voci.length > 0);
}
