import assert from 'node:assert/strict';
import fs from 'node:fs';
import { describe, it } from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { fromFoundry } from '../lib/scheda/foundry.mjs';
import { fillSheetPdf } from '../lib/scheda/pdf.mjs';
import { evalBonus, pactSlots, proficiencyBonus, spellSlots } from '../lib/scheda/rules.mjs';
import { spellDetails } from '../lib/scheda/spells.mjs';
import { isSrdFeature, plainText } from '../lib/scheda/srd.mjs';
import { diffSheets } from '../lib/scheda/storico.mjs';

const abilities = (scores) =>
  Object.fromEntries(Object.entries(scores).map(([k, [value, proficient]]) => [k, { value, proficient: proficient ? 1 : 0 }]));

const hpAdvancement = (levels) => ({
  a1: { type: 'HitPoints', value: Object.fromEntries(Array.from({ length: levels }, (_, i) => [i + 1, i === 0 ? 'max' : 'avg'])) },
});

function warlock({ level = 6, extraItems = [] } = {}) {
  return {
    name: 'Test',
    type: 'character',
    system: {
      abilities: abilities({ str: [8], dex: [16], con: [14], int: [10], wis: [10, true], cha: [18, true] }),
      attributes: { hp: { max: null }, ac: {}, init: {}, movement: { speeds: {} }, senses: {}, spellcasting: 'cha' },
      details: { alignment: '', xp: { value: 14000 } },
      skills: { dec: { value: 1 }, ste: { value: 2 } },
      traits: {
        armorProf: { value: ['lgt'] },
        weaponProf: { value: ['sim', 'rapier'] },
        languages: { value: ['common', 'elvish'], custom: 'Segni' },
      },
      tools: {},
      currency: { gp: 12 },
    },
    items: [
      { type: 'race', name: 'Elf (Drow)', system: { movement: { speeds: { walk: '30' }, units: 'ft' }, senses: { ranges: { darkvision: 120 } } } },
      {
        type: 'class',
        name: 'Warlock',
        system: { identifier: 'warlock', levels: level, hd: { denomination: 'd8' }, spellcasting: { progression: 'pact' }, advancement: hpAdvancement(level) },
      },
      { type: 'equipment', name: 'Leather Armor', system: { equipped: true, type: { value: 'light' }, armor: { value: 11 } } },
      {
        type: 'weapon',
        name: '+1 Rapier',
        system: {
          equipped: true,
          magicalBonus: '+1',
          properties: ['fin', 'mgc'],
          type: { value: 'martialM', baseItem: 'rapier' },
          damage: { base: { number: 1, denomination: 8, types: ['piercing'] } },
        },
      },
      {
        type: 'equipment',
        name: 'Rod',
        system: { equipped: true, attunement: 'required', attuned: true, type: { value: 'rod' }, properties: ['mgc'] },
        effects: [{ transfer: true, system: { changes: [{ key: 'system.bonuses.spell.dc', value: '+1' }] } }],
      },
      { type: 'loot', name: 'Rope', system: { quantity: 1 } },
      { type: 'loot', name: 'Rope', system: { quantity: 2 } },
      { type: 'feat', name: 'Dash', system: { type: { value: '' } } },
      { type: 'feat', name: 'Agonizing Blast', system: { type: { value: 'class' } } },
      { type: 'spell', name: 'Eldritch Blast', system: { level: 0, prepared: 2, method: 'spell', sourceItem: 'class:warlock' } },
      { type: 'spell', name: 'Fireball', system: { level: 3, prepared: 1, method: 'pact', sourceItem: 'class:warlock' } },
      {
        type: 'spell',
        name: 'Darkness',
        system: { level: 2, prepared: 2, method: 'spell', sourceItem: 'race:elf-drow', uses: { max: '1', recovery: [{ period: 'lr' }] } },
      },
      { type: 'spell', name: 'Bane', system: { level: 1, prepared: 0, method: 'spell', sourceItem: 'class:cleric' } },
      ...extraItems,
    ],
  };
}

describe('rules', () => {
  it('derives proficiency and slots', () => {
    assert.deepEqual([1, 4, 5, 9, 17].map(proficiencyBonus), [2, 2, 3, 4, 6]);
    assert.deepEqual(spellSlots([{ levels: 6, progression: 'full' }]), { 1: 4, 2: 3, 3: 3 });
    assert.deepEqual(spellSlots([{ levels: 5, progression: 'half' }, { levels: 3, progression: 'full' }]), { 1: 4, 2: 3, 3: 2 });
    assert.deepEqual(pactSlots(6), { livello: 3, slot: 2 });
    assert.equal(pactSlots(0), null);
  });

  it('evaluates simple bonus formulas and ignores dice', () => {
    const ctx = { mods: { cha: 4 }, prof: 3 };
    assert.equal(evalBonus('+1', ctx), 1);
    assert.equal(evalBonus('@abilities.cha.mod', ctx), 4);
    assert.equal(evalBonus('2 + @prof', ctx), 5);
    assert.equal(evalBonus('1d4', ctx), 0);
  });
});

describe('fromFoundry', () => {
  const sheet = fromFoundry(warlock(), { data: '2026-11-24', sessione: 13 });

  it('computes the derived numbers', () => {
    assert.equal(sheet.livello, 6);
    assert.equal(sheet.competenza, 3);
    assert.equal(sheet.pf, 8 + 5 * 5 + 2 * 6);
    assert.equal(sheet.ca, 14);
    assert.equal(sheet.caratteristiche.cha.salvezza, 7);
    assert.equal(sheet.abilita.ste.bonus, 9);
    assert.equal(sheet.percezionePassiva, 10);
    assert.equal(sheet.velocita, '30 ft');
    assert.deepEqual(sheet.sensi, ['Darkvision 120 ft']);
  });

  it('builds attacks with finesse, magic bonus and proficiency', () => {
    assert.deepEqual(sheet.attacchi, [{ nome: '+1 Rapier', bonus: 7, danni: '1d8+4 piercing' }]);
  });

  it('applies equipped item effects and pact slots to spellcasting', () => {
    assert.equal(sheet.incantesimi.cd, 16);
    assert.deepEqual(sheet.incantesimi.patto, { livello: 3, slot: 2 });
    assert.deepEqual(sheet.incantesimi.slot, {});
  });

  it('lists only spells the character can actually cast', () => {
    assert.deepEqual(
      sheet.incantesimi.elenco.map((s) => s.nome),
      ['Eldritch Blast', 'Darkness', 'Fireball']
    );
    assert.deepEqual(sheet.incantesimi.elenco[1], { nome: 'Darkness', livello: 2, preparato: true, sempre: true, usi: '1/long rest', dettagli: {} });
  });

  it('drops basic actions and merges duplicate items', () => {
    assert.deepEqual(sheet.privilegi, [{ nome: 'Agonizing Blast', fonte: 'classe' }]);
    assert.equal(sheet.equipaggiamento.find((i) => i.nome === 'Rope').quantita, 3);
    assert.equal(sheet.equipaggiamento.find((i) => i.nome === 'Rod').sintonia, true);
    assert.deepEqual(sheet.competenze.lingue, ['Common', 'Elvish', 'Segni']);
    assert.deepEqual(sheet.monete, { mp: 0, mo: 12, me: 0, ma: 0, mr: 0 });
  });
});

describe('feature uses', () => {
  it('resolves class scale values and ability modifiers', () => {
    const actor = warlock({
      extraItems: [
        { type: 'feat', name: 'Pact Boon', system: { type: { value: 'class' }, uses: { max: '@abilities.cha.mod', recovery: [{ period: 'lr' }] } } },
        { type: 'feat', name: 'Channel Divinity', system: { type: { value: 'class' }, uses: { max: '@scale.warlock.channel', recovery: [{ period: 'sr' }] } } },
      ],
    });
    actor.items.find((i) => i.type === 'class').system.advancement.s1 = {
      type: 'ScaleValue',
      configuration: { identifier: 'channel', scale: { 2: { value: 1 }, 6: { value: 2 }, 18: { value: 3 } } },
    };
    const uses = Object.fromEntries(fromFoundry(actor, { data: '2026-11-24' }).privilegi.map((p) => [p.nome, p.usi]));
    assert.equal(uses['Pact Boon'], '4/long rest');
    assert.equal(uses['Channel Divinity'], '2/short rest');
    assert.equal(uses['Agonizing Blast'], undefined);
  });
});

describe('diffSheets', () => {
  it('reports what changed between two levels', () => {
    const before = fromFoundry(warlock({ level: 5 }), { data: '2026-10-01' });
    const after = fromFoundry(
      warlock({ extraItems: [{ type: 'feat', name: "Dark One's Own Luck", system: { type: { value: 'class' } } }] }),
      { data: '2026-11-24' }
    );
    const groups = Object.fromEntries(diffSheets(before, after).map((g) => [g.titolo, g.voci]));
    assert.deepEqual(groups['Valori'], ['Hit Points: 38 → 45']);
    assert.deepEqual(groups['Nuovi privilegi'], ["Dark One's Own Luck"]);
    assert.equal(groups['Oggetti nuovi'], undefined);
  });
});

describe('fillSheetPdf', () => {
  it('fills the named fields and the spell page', async () => {
    const template = fs.readFileSync(new URL('../assets/scheda-5e.pdf', import.meta.url));
    const sheet = fromFoundry(warlock(), { data: '2026-11-24' });
    const form = (await PDFDocument.load(await fillSheetPdf(template, sheet, { nome: 'Erieth' }))).getForm();
    const value = (name) => form.getFields().find((f) => f.getName().trim().replace(/\s+/g, ' ') === name).getText();
    assert.equal(value('CharacterName'), 'Erieth');
    assert.equal(value('ClassLevel'), 'Warlock 6');
    assert.equal(value('AC'), '14');
    assert.equal(value('SpellSaveDC 2'), '16');
    assert.equal(value('Wpn1 AtkBonus'), '+7');
    assert.equal(value('Stealth'), '+9');
    assert.ok(form.getCheckBox('Check Box 22').isChecked(), 'Charisma save proficiency');
    assert.equal(value('SlotsTotal 21'), '2');
  });
});

describe('spellDetails', () => {
  it('summarizes a spell from structured data only', () => {
    const fireball = {
      system: {
        school: 'evo',
        properties: ['vocal', 'somatic', 'material'],
        activation: { type: 'action', value: 1 },
        range: { value: '150', units: 'ft' },
        target: { template: { type: 'sphere', size: '20', units: 'ft' } },
        duration: { value: '0', units: 'inst' },
        materials: { value: 'bat guano', cost: 0 },
        activities: { a: { type: 'save', save: { ability: ['dex'] }, damage: { parts: [{ number: 8, denomination: 6, types: ['fire'] }] } } },
      },
    };
    assert.deepEqual(spellDetails(fireball), {
      school: 'Evocation',
      casting: '1 action',
      range: '150 ft (20-foot sphere)',
      components: 'V, S, M',
      duration: 'Instantaneous',
      effect: 'DEX save, 8d6 fire',
    });
  });

  it('keeps the base of scaled values and marks concentration', () => {
    const details = spellDetails({
      system: {
        properties: ['concentration'],
        range: { units: 'self' },
        target: { template: { type: 'cube', size: '30 + (@scaling.increase * 5)', units: 'ft' } },
        duration: { value: '10', units: 'minute' },
      },
    });
    assert.equal(details.range, 'Self (30-foot cube)');
    assert.equal(details.duration, 'Concentration, up to 10 minutes');
  });
});

describe('SRD feature text', () => {
  const feature = (name, book, rules = '2014') => ({ name, system: { source: { book, rules } } });

  it('allows only SRD 5.1 features with the 2014 PHB wording', () => {
    assert.ok(isSrdFeature(feature('Sneak Attack', "PHB'14")));
    assert.ok(isSrdFeature(feature('Destroy Undead (CR 1/2)', "PHB'14")));
    assert.ok(isSrdFeature(feature('Eldritch Invocations: Repelling Blast', "PHB'14")));
    assert.ok(!isSrdFeature(feature('Portent', "PHB'14")), 'Divination is not in the SRD');
    assert.ok(!isSrdFeature(feature('Eldritch Invocations: Agonizing Blast', 'XUA23P5')), 'Unearthed Arcana wording');
    assert.ok(!isSrdFeature(feature('Cunning Action', '', '2024')));
  });

  it('turns Foundry HTML and enrichers into plain paragraphs', () => {
    const html = '<p>Deal an extra [[/damage 1d6]] damage; the enemy isn&#39;t &amp;Reference[condition=incapacitated].</p><p>See @UUID[Compendium.x.y]{Turn Undead}.</p>';
    assert.equal(plainText(html), "Deal an extra 1d6 damage; the enemy isn't incapacitated.\n\nSee Turn Undead.");
  });
});
