// What changed on an investigator's sheet between two chapters, as short
// lines grouped by an Italian heading; game terms stay as on the sheet.

import { CHARACTERISTICS, STATES, skillLabel } from './skills.mjs';

const byLabel = (skills) => new Map(skills.map((s) => [skillLabel(s), s.valore]));

function values(prev, next) {
  const lines = [];
  const change = (label, a, b) => {
    if (a !== undefined && b !== undefined && a !== b) lines.push(`${label} ${a} → ${b}`);
  };
  for (const [key, abbr] of Object.entries(CHARACTERISTICS)) change(abbr, prev.caratteristiche[key], next.caratteristiche[key]);
  change('Hit Points (max)', prev.pf.max, next.pf.max);
  change('Magic Points (max)', prev.pm.max, next.pm.max);
  change('Sanity', prev.sanita.attuale ?? prev.sanita.iniziale, next.sanita.attuale ?? next.sanita.iniziale);
  change('Max Sanity', prev.sanita.massima, next.sanita.massima);
  change('Luck', prev.fortuna.attuale ?? prev.fortuna.iniziale, next.fortuna.attuale ?? next.fortuna.iniziale);
  return lines;
}

/**
 * @returns {{ titolo: string, voci: string[] }[]} only the non-empty groups
 */
export function diffSheets(prev, next) {
  const before = byLabel(prev.abilita);
  const after = byLabel(next.abilita);
  const raised = [...after].filter(([l, v]) => before.has(l) && v > before.get(l)).map(([l, v]) => `${l} ${before.get(l)} → ${v}`);
  const added = [...after].filter(([l]) => !before.has(l)).map(([l, v]) => `${l} ${v}`);
  const state = (list) => list.map((k) => STATES[k][0]);
  const groups = [
    { titolo: 'Valori', voci: values(prev, next) },
    { titolo: 'Abilità migliorate', voci: raised },
    { titolo: 'Nuove abilità', voci: added },
    { titolo: 'Nuovi stati', voci: state(next.stati.filter((s) => !prev.stati.includes(s))) },
    { titolo: 'Stati superati', voci: state(prev.stati.filter((s) => !next.stati.includes(s))) },
    { titolo: 'Armi nuove', voci: next.armi.filter((w) => !prev.armi.some((p) => p.nome === w.nome)).map((w) => w.nome) },
  ];
  return groups.filter((g) => g.voci.length > 0);
}
