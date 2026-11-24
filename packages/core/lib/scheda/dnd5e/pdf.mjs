// Fills the official fillable 5e character sheet with a compact sheet.
// Page 1 and 2 fields are named; the spell page is read from the template's
// layout, since its field numbers don't follow the printed order.

import { PDFButton, PDFCheckBox, PDFDocument, PDFTextField, StandardFonts } from 'pdf-lib';
import { ABILITIES, FEATURE_SOURCES, SKILLS, classLine } from './labels.mjs';

const SAVE_BOXES = { str: 11, dex: 18, con: 19, int: 20, wis: 21, cha: 22 };
const SKILL_FIELDS = {
  acr: 'Acrobatics', ani: 'Animal', arc: 'Arcana', ath: 'Athletics', dec: 'Deception', his: 'History',
  ins: 'Insight', itm: 'Intimidation', inv: 'Investigation', med: 'Medicine', nat: 'Nature', prc: 'Perception',
  prf: 'Performance', per: 'Persuasion', rel: 'Religion', slt: 'SleightofHand', ste: 'Stealth', sur: 'Survival',
};
const ABILITY_FIELDS = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
const MOD_FIELDS = { str: 'STRmod', dex: 'DEXmod', con: 'CONmod', int: 'INTmod', wis: 'WISmod', cha: 'CHamod' };
const SAVE_FIELDS = { str: 'ST Strength', dex: 'ST Dexterity', con: 'ST Constitution', int: 'ST Intelligence', wis: 'ST Wisdom', cha: 'ST Charisma' };
const SMALL_BOXES = new Set([...Object.values(SKILL_FIELDS), ...Object.values(SAVE_FIELDS)]);
const WEAPON_ROWS = [
  ['Wpn Name', 'Wpn1 AtkBonus', 'Wpn1 Damage'],
  ['Wpn Name 2', 'Wpn2 AtkBonus', 'Wpn2 Damage'],
  ['Wpn Name 3', 'Wpn3 AtkBonus', 'Wpn3 Damage'],
];

const sign = (n) => (n >= 0 ? `+${n}` : `${n}`);

// Helvetica only encodes WinAnsi: drop what it can't draw rather than fail.
const printable = (s) => String(s).replace(/[^\n\x20-\xFF‘’“”–—…•€]/g, '');

// The template leaves most sizes on "auto", which blows the big boxes up to
// a few huge words and crops short numbers in the small ones.
const FONT_SIZES = {
  AC: 16, Initiative: 14, Speed: 12, HPMax: 10, HDTotal: 9, Passive: 12,
  AttacksSpellcasting: 8, ProficienciesLang: 8, Equipment: 8, 'Features and Traits': 8,
  'Feat+Traits': 8, Treasure: 8,
};
// Save and skill boxes are 14pt wide: at the template's size "+10" loses a
// digit. Size 0 means "fit the box", which viewers that redraw fields honor too.
const SMALL_BOX_SIZE = 0;

// Some fields have no default appearance at all, which pdf-lib's own
// setFontSize refuses; the font name is irrelevant, the embedded one is used.
function setFontSize(field, size) {
  const da = `/Helv ${size} Tf 0 g`;
  field.acroField.setDefaultAppearance(da);
  for (const widget of field.acroField.getWidgets()) widget.setDefaultAppearance(da);
}

// Several names carry stray or doubled spaces ("SpellSaveDC  2").
const fieldKey = (name) => name.trim().replace(/\s+/g, ' ');

/**
 * @param {Uint8Array} template the blank fillable sheet
 * @param {any} sheet a compact sheet (see foundry.mjs)
 * @param {{ nome: string, ritratto?: Uint8Array }} meta the character's name as the site shows it, and a JPEG portrait
 */
export async function fillSheetPdf(template, sheet, { nome, ritratto }) {
  const doc = await PDFDocument.load(template);
  const form = doc.getForm();
  const fields = new Map(form.getFields().map((f) => [fieldKey(f.getName()), f]));
  const text = (name, value) => {
    const field = fields.get(name);
    if (!(field instanceof PDFTextField) || value == null || value === '') return;
    const size = FONT_SIZES[name] ?? (SMALL_BOXES.has(name) ? SMALL_BOX_SIZE : undefined);
    if (size !== undefined) setFontSize(field, size);
    field.setText(printable(value));
  };
  const check = (name, on) => {
    const field = fields.get(name);
    if (field instanceof PDFCheckBox && on) field.check();
  };

  fillFront(sheet, nome, text, check);
  fillDetails(sheet, nome, text);
  if (sheet.incantesimi) fillSpells(doc, form, sheet, text, check);

  const portrait = fields.get('CHARACTER IMAGE');
  if (ritratto && portrait instanceof PDFButton) portrait.setImage(await doc.embedJpg(ritratto));

  form.updateFieldAppearances(await doc.embedFont(StandardFonts.Helvetica));
  return doc.save();
}

function fillFront(sheet, nome, text, check) {
  text('CharacterName', nome);
  text('ClassLevel', classLine(sheet));
  text('Background', sheet.background);
  text('Race', sheet.razza);
  text('Alignment', sheet.allineamento);
  text('XP', sheet.pe);
  text('ProfBonus', sign(sheet.competenza));
  text('AC', sheet.ca);
  text('Initiative', sign(sheet.iniziativa));
  text('Speed', sheet.velocita);
  text('HPMax', sheet.pf);
  text('HDTotal', sheet.dadiVita);
  text('Passive', sheet.percezionePassiva);

  for (const [key, ability] of Object.entries(sheet.caratteristiche)) {
    text(ABILITY_FIELDS[key], ability.valore);
    text(MOD_FIELDS[key], sign(ability.mod));
    text(SAVE_FIELDS[key], sign(ability.salvezza));
    check(`Check Box ${SAVE_BOXES[key]}`, ability.competente);
  }
  Object.keys(SKILLS).forEach((key, i) => {
    const skill = sheet.abilita[key];
    text(SKILL_FIELDS[key], sign(skill.bonus));
    check(`Check Box ${23 + i}`, skill.competenza >= 1);
  });

  const [shown, rest] = [sheet.attacchi.slice(0, 3), sheet.attacchi.slice(3)];
  shown.forEach((a, i) => {
    const [name, bonus, damage] = WEAPON_ROWS[i];
    text(name, a.nome);
    text(bonus, sign(a.bonus));
    text(damage, a.danni);
  });
  const spells = sheet.incantesimi && `Spell save DC ${sheet.incantesimi.cd}, spell attack ${sign(sheet.incantesimi.attacco)}`;
  text('AttacksSpellcasting', [...rest.map((a) => `${a.nome} ${sign(a.bonus)}, ${a.danni}`), spells].filter(Boolean).join('\n'));

  const { mp, mo, me, ma, mr } = sheet.monete;
  [['PP', mp], ['GP', mo], ['EP', me], ['SP', ma], ['CP', mr]].forEach(([f, v]) => v && text(f, v));

  const c = sheet.competenze;
  text(
    'ProficienciesLang',
    [
      ['Armor', c.armature],
      ['Weapons', c.armi],
      ['Tools', c.strumenti],
      ['Languages', c.lingue],
    ]
      .filter(([, list]) => list.length)
      .map(([label, list]) => `${label}: ${list.join(', ')}`)
      .join('\n\n')
  );

  const item = (i) => `${i.nome}${i.quantita > 1 ? ` (${i.quantita})` : ''}`;
  text('Equipment', sheet.equipaggiamento.filter((i) => !i.magico).map(item).join(', '));
  text('Features and Traits', features(sheet, ['classe']));
}

function features(sheet, sources) {
  return sources
    .map((source) => [
      FEATURE_SOURCES[source],
      sheet.privilegi.filter((p) => p.fonte === source).map((p) => (p.usi ? `${p.nome} (${p.usi})` : p.nome)),
    ])
    .filter(([, list]) => list.length)
    .map(([label, list]) => `${label}\n${list.map((n) => `• ${n}`).join('\n')}`)
    .join('\n\n');
}

function fillDetails(sheet, nome, text) {
  text('CharacterName 2', nome);
  text('Feat+Traits', [features(sheet, ['razza', 'background', 'talento']), sheet.sensi.join(', ')].filter(Boolean).join('\n\n'));
  const magic = sheet.equipaggiamento.filter((i) => i.magico);
  text('Treasure', magic.map((i) => `${i.nome}${i.sintonia ? ' (attuned)' : ''}`).join('\n'));
}

// Groups the spell page's fields by printed block: each spell level starts at
// its "SlotsTotal 18+N" field, cantrips sit above level 1 in the first column.
function spellLayout(doc, form) {
  const page = doc.getPages()[2];
  const widgets = form
    .getFields()
    .flatMap((field) => field.acroField.getWidgets().map((w) => ({ field, w })))
    .filter(({ w }) => w.P() === page.ref)
    .map(({ field, w }) => {
      const { x, y } = w.getRectangle();
      return { field, name: fieldKey(field.getName()), x, y, col: x < 200 ? 0 : x < 400 ? 1 : 2 };
    });
  const headers = widgets
    .filter((w) => /^SlotsTotal \d+$/.test(w.name))
    .map((w) => ({ ...w, level: Number(w.name.split(' ')[1]) - 18 }));
  const lines = widgets.filter((w) => /^Spells \d+$/.test(w.name));
  const boxes = widgets.filter((w) => w.field instanceof PDFCheckBox);

  const block = (col, top, bottom) =>
    lines
      .filter((l) => l.col === col && l.y < top && l.y > bottom)
      .sort((a, b) => b.y - a.y)
      .map((l) => ({ line: l.name, box: boxes.find((b) => b.col === col && Math.abs(b.y - l.y) <= 4)?.name }));

  const levels = { 0: block(0, Infinity, headers.find((h) => h.level === 1).y) };
  for (const h of headers) {
    const below = headers.filter((o) => o.col === h.col && o.y < h.y).sort((a, b) => b.y - a.y)[0];
    levels[h.level] = block(h.col, h.y, below?.y ?? -Infinity);
  }
  return { levels, slots: Object.fromEntries(headers.map((h) => [h.level, h.name])) };
}

function fillSpells(doc, form, sheet, text, check) {
  const s = sheet.incantesimi;
  text('Spellcasting Class 2', classLine(sheet));
  text('SpellcastingAbility 2', ABILITIES[s.caratteristica]);
  text('SpellSaveDC 2', s.cd);
  text('SpellAtkBonus 2', sign(s.attacco));

  const layout = spellLayout(doc, form);
  const slots = { ...s.slot };
  if (s.patto) slots[s.patto.livello] = (slots[s.patto.livello] ?? 0) + s.patto.slot;
  for (const [level, n] of Object.entries(slots)) text(layout.slots[level], n);

  for (const [level, rows] of Object.entries(layout.levels)) {
    const spells = s.elenco.filter((sp) => sp.livello === Number(level));
    const fits = spells.length <= rows.length ? spells : spells.slice(0, rows.length - 1);
    fits.forEach((sp, i) => {
      const notes = [sp.sempre && 'always', sp.usi].filter(Boolean);
      text(rows[i].line, `${sp.nome}${notes.length ? ` (${notes.join(', ')})` : ''}`);
      if (rows[i].box) check(rows[i].box, sp.preparato && sp.livello > 0);
    });
    if (fits.length < spells.length) text(rows[rows.length - 1].line, `…e altri ${spells.length - fits.length}`);
  }
}
