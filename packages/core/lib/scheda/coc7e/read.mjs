// Reads a filled copy of Chaosium's fillable "1920s Era Investigator" sheet
// into the compact sheet the site stores. Only the front page's numbers are
// read: the backstory side stays with the player.

import { PDFCheckBox, PDFDocument, PDFTextField } from 'pdf-lib';
import { CHARACTERISTICS, CUSTOM_SLOTS, SKILLS, SPECIALTIES, STATES, baseValue } from './skills.mjs';

/**
 * @param {Uint8Array} bytes a filled Chaosium sheet
 * @param {{ capitolo: number, data: string }} meta
 */
export async function readChaosiumPdf(bytes, meta) {
  const form = (await PDFDocument.load(bytes)).getForm();
  const fields = new Map(form.getFields().map((f) => [f.getName().trim(), f]));
  const text = (name) => {
    const field = fields.get(name);
    return field instanceof PDFTextField ? field.getText()?.trim() || undefined : undefined;
  };
  const checked = (name) => {
    const field = fields.get(name);
    return field instanceof PDFCheckBox && field.isChecked();
  };
  return fromFields(text, checked, meta);
}

const toInt = (s) => {
  const n = Number.parseInt(String(s ?? '').replace(/[^\d-]/g, ''), 10);
  return Number.isNaN(n) ? undefined : n;
};

/** @param {(name: string) => string | undefined} text @param {(name: string) => boolean} checked */
export function fromFields(text, checked, { capitolo, data }) {
  const num = (name) => toInt(text(name));
  const caratteristiche = Object.fromEntries(Object.entries(CHARACTERISTICS).map(([k, f]) => [k, num(f) ?? 0]));

  const abilita = [];
  const skill = (key, entry, base) => {
    const valore = num(`Skill_${key}`);
    if (valore === undefined || (!entry.specialita && valore === base)) return;
    abilita.push({ ...entry, valore });
  };
  for (const [nome, base, key] of SKILLS) skill(key, { nome }, baseValue(base, caratteristiche));
  for (const [nome, [base, keys]] of Object.entries(SPECIALTIES)) {
    for (const key of keys) {
      const def = text(`SkillDef_${key}`);
      // Some sheets leave the category's own name in the line ("Science").
      const specialita = def && def.toLowerCase() !== nome.toLowerCase() ? def : undefined;
      if (!specialita && (num(`Skill_${key}`) ?? 0) <= (baseValue(base, caratteristiche) ?? 0)) continue;
      skill(key, { nome, ...(specialita ? { specialita } : {}) }, baseValue(base, caratteristiche));
    }
  }
  for (const key of CUSTOM_SLOTS) {
    const nome = text(`SkillDef_${key}`);
    if (nome) skill(key, { nome }, undefined);
  }

  const armi = [1, 2, 3]
    .filter((i) => text(`Weapon_Name${i}`))
    .map((i) => clean({
      nome: text(`Weapon_Name${i}`),
      valore: num(`Weapon_Regular${i}`) ?? 0,
      danni: text(`Weapon_Damage${i}`) ?? '',
      attacchi: text(`Weapon_Attacks${i}`),
      gittata: text(`Weapon_Range${i}`),
      munizioni: text(`Weapon_Ammo${i}`),
      malfunzionamento: text(`Weapon_Malf${i}`),
    }));

  return clean({
    capitolo,
    data,
    occupazione: text('Occupation') ?? '',
    eta: num('Age'),
    caratteristiche,
    pf: clean({ max: num('StartingHP') ?? 0, attuali: num('CurrentHP') }),
    pm: clean({ max: num('StartingMagic') ?? 0, attuali: num('CurrentMagic') }),
    fortuna: clean({ iniziale: num('StartingLuck') ?? 0, attuale: num('CurrentLuck') }),
    sanita: clean({ iniziale: num('StartingSanity') ?? 0, attuale: num('CurrentSanity'), massima: num('MaxSanity'), soglia: num('InsaneSanity') }),
    stati: Object.entries(STATES).filter(([, [, field]]) => checked(field)).map(([key]) => key),
    movimento: num('MOV') ?? 0,
    corporatura: num('Build') ?? 0,
    bonusDanno: text('DamageBonus') ?? '0',
    abilita,
    armi,
  });
}

const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
