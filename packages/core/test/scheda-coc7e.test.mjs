import assert from 'node:assert/strict';
import fs from 'node:fs';
import { describe, it } from 'node:test';
import { fillSheetPdf } from '../lib/scheda/coc7e/pdf.mjs';
import { fromFields, readChaosiumPdf } from '../lib/scheda/coc7e/read.mjs';
import { diffSheets } from '../lib/scheda/coc7e/storico.mjs';

const filled = {
  Occupation: 'Professor', Age: '26',
  STR: '40', CON: '65', SIZ: '60', DEX: '55', APP: '65', INT: '80', POW: '50', EDU: '80',
  StartingHP: '12', StartingMagic: '10', CurrentMagic: '9', StartingLuck: '55', StartingSanity: '50', CurrentSanity: '48', InsaneSanity: '10',
  MOV: '7', Build: '0', DamageBonus: '0',
  Skill_Dodge: '27', Skill_History: '60', Skill_Persuade: '10', Skill_Climb: '20',
  SkillDef_OtherLanguage: 'German', Skill_OtherLanguage: '73',
  SkillDef_Science1: 'Science', Skill_Science1: '1',
  SkillDef_Custom1: 'Geroglifici Egizi', Skill_Custom1: '45',
  Weapon_Name1: '.38 Automatic', Weapon_Regular1: '40', Weapon_Damage1: '1D10', Weapon_Range1: '15 yds',
};
const checks = new Set(['Skill_Persuade_Chk', 'Skill_History_Chk', 'IndefInsanity_Chk']);
const sheet = fromFields((n) => filled[n], (n) => checks.has(n), { capitolo: 8, data: '2026-11-22' });

describe('coc7e: reading the Chaosium sheet', () => {
  it('reads characteristics, pools, states and combat values', () => {
    assert.equal(sheet.caratteristiche.edu, 80);
    assert.deepEqual(sheet.pm, { max: 10, attuali: 9 });
    assert.deepEqual(sheet.sanita, { iniziale: 50, attuale: 48, soglia: 10 });
    assert.deepEqual(sheet.stati, ['folliaIndefinita']);
    assert.equal(sheet.bonusDanno, '0');
  });

  it('keeps raised skills, drops those at their base and the improvement checks', () => {
    assert.deepEqual(sheet.abilita, [
      { nome: 'History', valore: 60 },
      { nome: 'Language (Other)', specialita: 'German', valore: 73 },
      { nome: 'Geroglifici Egizi', valore: 45 },
    ]);
    assert.deepEqual(sheet.armi, [{ nome: '.38 Automatic', valore: 40, danni: '1D10', gittata: '15 yds' }]);
  });
});

describe('coc7e: filling the Chaosium sheet', () => {
  it('round-trips through the template', async () => {
    const template = fs.readFileSync(new URL('../assets/scheda-coc7e.pdf', import.meta.url));
    const pdf = await fillSheetPdf(template, sheet, { nome: 'Hans Traeumer' });
    const back = await readChaosiumPdf(pdf, { capitolo: 8, data: '2026-11-22' });
    assert.deepEqual(back, sheet);
  });
});

describe('coc7e: history', () => {
  it('lists raised skills, sanity and new states', () => {
    const next = structuredClone(sheet);
    next.sanita.attuale = 41;
    next.abilita[0].valore = 64;
    next.stati.push('folliaTemporanea');
    const groups = Object.fromEntries(diffSheets(sheet, next).map((g) => [g.titolo, g.voci]));
    assert.deepEqual(groups['Valori'], ['Sanity 48 → 41']);
    assert.deepEqual(groups['Abilità migliorate'], ['History 60 → 64']);
    assert.deepEqual(groups['Nuovi stati'], ['Temporary Insanity']);
  });
});
