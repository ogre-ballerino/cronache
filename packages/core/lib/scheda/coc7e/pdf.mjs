// Fills Chaosium's fillable "1920s Era Investigator" sheet with a compact
// sheet: the front page only, as the site publishes nothing else.

import { PDFButton, PDFCheckBox, PDFDocument, PDFTextField, StandardFonts } from 'pdf-lib';
import { CHARACTERISTICS, CUSTOM_SLOTS, SKILLS, SPECIALTIES, STATES, baseValue, fifth, half } from './skills.mjs';

// Helvetica only encodes WinAnsi: drop what it can't draw rather than fail.
const printable = (s) => String(s).replace(/[^\n\x20-\xFF‘’“”–—…•€]/g, '');

// Specialty and weapon lines are short: shrink their text to fit (size 0 =
// fit the box, which viewers that redraw fields honor too).
const FIT_TO_BOX = /^(SkillDef_|Weapon_(Name|Damage|Attacks|Range|Ammo|Malf))/;

function fitToBox(field) {
  const da = '/Helv 0 Tf 0 g';
  field.acroField.setDefaultAppearance(da);
  for (const widget of field.acroField.getWidgets()) widget.setDefaultAppearance(da);
}

/**
 * @param {Uint8Array} template the blank fillable sheet
 * @param {any} sheet a compact sheet (see schema.ts)
 * @param {{ nome: string, ritratto?: Uint8Array }} meta the investigator's name as the site shows it, and a JPEG portrait
 */
export async function fillSheetPdf(template, sheet, { nome, ritratto }) {
  const doc = await PDFDocument.load(template);
  const form = doc.getForm();
  const fields = new Map(form.getFields().map((f) => [f.getName().trim(), f]));
  const text = (name, value) => {
    const field = fields.get(name);
    if (!(field instanceof PDFTextField) || value == null || value === '') return;
    if (FIT_TO_BOX.test(name)) fitToBox(field);
    field.setText(printable(value));
  };
  const check = (name, on) => {
    const field = fields.get(name);
    if (field instanceof PDFCheckBox && on) field.check();
  };
  const triple = (prefix, value, [h, f] = ['_half', '_fifth']) => {
    text(prefix, value);
    text(`${prefix}${h}`, half(value));
    text(`${prefix}${f}`, fifth(value));
  };

  text('Investigators_Name', nome);
  text('Occupation', sheet.occupazione);
  text('Age', sheet.invecchiamento ? `${sheet.eta} (+${sheet.invecchiamento})` : sheet.eta);
  for (const [key, field] of Object.entries(CHARACTERISTICS)) triple(field, sheet.caratteristiche[key]);

  text('StartingHP', sheet.pf.max);
  text('CurrentHP', sheet.pf.attuali);
  text('StartingMagic', sheet.pm.max);
  text('CurrentMagic', sheet.pm.attuali);
  text('StartingLuck', sheet.fortuna.iniziale);
  text('CurrentLuck', sheet.fortuna.attuale);
  text('StartingSanity', sheet.sanita.iniziale);
  text('CurrentSanity', sheet.sanita.attuale);
  text('MaxSanity', sheet.sanita.massima);
  text('InsaneSanity', sheet.sanita.soglia);
  for (const [key, [, field]] of Object.entries(STATES)) check(field, sheet.stati.includes(key));

  const skills = fillSkills(sheet, text, triple);
  triple('Dodge_Copy', skills.get('Dodge'));
  const brawl = skills.get('Fighting (Brawl)');
  text('Weapon_Regular0', brawl);
  text('Weapon_Hard0', half(brawl));
  text('Weapon_Extreme0', fifth(brawl));
  sheet.armi.slice(0, 3).forEach((w, i) => {
    const n = i + 1;
    text(`Weapon_Name${n}`, w.nome);
    text(`Weapon_Regular${n}`, w.valore);
    text(`Weapon_Hard${n}`, half(w.valore));
    text(`Weapon_Extreme${n}`, fifth(w.valore));
    text(`Weapon_Damage${n}`, w.danni);
    text(`Weapon_Attacks${n}`, w.attacchi);
    text(`Weapon_Range${n}`, w.gittata);
    text(`Weapon_Ammo${n}`, w.munizioni);
    text(`Weapon_Malf${n}`, w.malfunzionamento);
  });
  text('MOV', sheet.movimento);
  text('Build', sheet.corporatura);
  text('DamageBonus', sheet.bonusDanno);

  const portrait = fields.get('Portrait');
  if (ritratto && portrait instanceof PDFButton) portrait.setImage(await doc.embedJpg(ritratto));

  form.updateFieldAppearances(await doc.embedFont(StandardFonts.Helvetica));
  return doc.save();
}

// Standard skills go on their printed line, specialties on their category's
// lines; whatever doesn't fit, and the investigator's own skills, on the
// blank lines at the bottom. Returns each standard skill's value.
function fillSkills(sheet, text, triple) {
  const values = new Map();
  const write = (key, valore) => triple(`Skill_${key}`, valore);
  for (const [nome, base, key] of SKILLS) {
    const own = sheet.abilita.find((s) => s.nome === nome && !s.specialita);
    const valore = own?.valore ?? baseValue(base, sheet.caratteristiche);
    values.set(nome, valore);
    if (own) write(key, own.valore);
  }
  const custom = [...CUSTOM_SLOTS];
  const toCustom = (label, s) => {
    const key = custom.shift();
    if (!key) return;
    text(`SkillDef_${key}`, label);
    write(key, s.valore);
  };
  for (const [category, [, keys]] of Object.entries(SPECIALTIES)) {
    const free = [...keys];
    for (const s of sheet.abilita.filter((x) => x.nome === category)) {
      const key = free.shift();
      if (!key) {
        toCustom(`${category}: ${s.specialita ?? ''}`, s);
        continue;
      }
      if (s.specialita) text(`SkillDef_${key}`, s.specialita);
      write(key, s.valore);
    }
  }
  const known = new Set([...SKILLS.map(([n]) => n), ...Object.keys(SPECIALTIES)]);
  for (const s of sheet.abilita.filter((x) => !known.has(x.nome))) toCustom(s.nome, s);
  return values;
}
