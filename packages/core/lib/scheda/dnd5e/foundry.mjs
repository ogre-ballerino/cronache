// Turns a Foundry VTT dnd5e actor export into the compact sheet the site
// stores: only what a player reads on a sheet, with the values Foundry derives
// at runtime (modifiers, AC, HP, attack bonuses) already computed.

import { ARMOR, CLASSES, LANGUAGES, RECOVERY, SENSES, SKILLS, TOOLS, WEAPONS, label } from './labels.mjs';
import { evalBonus, modifier, pactSlots, proficiencyBonus, spellSlots } from './rules.mjs';
import { spellDetails } from './spells.mjs';
import { isSrdFeature, plainText } from './srd.mjs';

const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

// Plutonium and the SRD add these as race "features"; they only restate the race.
const FILLER_FEATURES = new Set(['Age', 'Alignment', 'Size', 'Speed', 'Languages', 'Skills', 'Feat', 'Ability Score Increase', 'Ability Score Improvement']);

const FEATURE_SOURCE = { class: 'classe', subclass: 'classe', race: 'razza', background: 'background', feat: 'talento' };

const values = (o) => (Array.isArray(o) ? o : Object.values(o ?? {}));

/**
 * @param {any} actor a dnd5e actor export (`fvtt-Actor-*.json`)
 * @param {{ data: string, sessione?: number }} meta
 */
export function fromFoundry(actor, { data, sessione }) {
  const ctx = context(actor);
  const sheet = {
    livello: ctx.level,
    data,
    ...(sessione ? { sessione } : {}),
    classi: ctx.classes.map(({ item, subclass }) => ({
      nome: label(CLASSES, item.system.identifier),
      ...(subclass ? { sottoclasse: subclass.name } : {}),
      livelli: item.system.levels,
      dadoVita: Number(item.system.hd.denomination.slice(1)),
    })),
    razza: ctx.race?.name ?? '',
    background: actor.items.find((i) => i.type === 'background')?.name ?? '',
    allineamento: actor.system.details.alignment ?? '',
    pe: actor.system.details.xp?.value ?? 0,
    competenza: ctx.prof,
    caratteristiche: abilities(actor, ctx),
    abilita: skills(actor, ctx),
    pf: hitPoints(actor, ctx),
    ca: armorClass(actor, ctx),
    iniziativa: ctx.mods[actor.system.attributes.init?.ability || 'dex'] + evalBonus(actor.system.attributes.init?.bonus, ctx) + effectBonus(ctx, /attributes\.init\.bonus$/),
    velocita: speed(actor, ctx),
    sensi: senses(actor, ctx),
    dadiVita: ctx.classes.map(({ item }) => `${item.system.levels}${item.system.hd.denomination}`).join(' + '),
    attacchi: attacks(actor, ctx),
    incantesimi: spellcasting(actor, ctx),
    privilegi: features(actor, ctx),
    competenze: proficiencies(actor),
    equipaggiamento: inventory(actor),
    monete: coins(actor.system.currency),
  };
  sheet.percezionePassiva = 10 + sheet.abilita.prc.bonus;
  return sheet;
}

function context(actor) {
  const classes = actor.items
    .filter((i) => i.type === 'class')
    .map((item) => ({
      item,
      subclass: actor.items.find((s) => s.type === 'subclass' && s.system.classIdentifier === item.system.identifier),
    }));
  const level = classes.reduce((sum, { item }) => sum + item.system.levels, 0);
  const mods = Object.fromEntries(ABILITY_KEYS.map((k) => [k, modifier(actor.system.abilities[k].value)]));
  const ctx = { classes, level, mods, prof: proficiencyBonus(level), race: actor.items.find((i) => i.type === 'race') };
  ctx.effects = activeChanges(actor);
  ctx.scales = scaleValues(classes);
  return ctx;
}

// "@scale.cleric.channel-divinity" → its numeric value at the class's level.
function scaleValues(classes) {
  const scales = {};
  for (const { item, subclass } of classes) {
    for (const owner of [item, subclass].filter(Boolean)) {
      for (const adv of values(owner.system.advancement)) {
        if (adv.type !== 'ScaleValue') continue;
        const reached = Object.entries(adv.configuration?.scale ?? {})
          .filter(([lvl]) => Number(lvl) <= item.system.levels)
          .sort(([a], [b]) => Number(b) - Number(a))[0]?.[1];
        if (typeof reached?.value === 'number') scales[`${owner.system.identifier}.${adv.configuration.identifier}`] = reached.value;
      }
    }
  }
  return scales;
}

// Changes from effects that apply passively: features always, items only
// while equipped (and attuned, when they need it). Spells apply only on cast.
function activeChanges(actor) {
  const active = (item) =>
    item.type === 'feat' ||
    item.type === 'race' ||
    (item.type !== 'spell' && item.system.equipped && (item.system.attunement !== 'required' || item.system.attuned));
  return actor.items
    .filter(active)
    .flatMap((item) => item.effects ?? [])
    .filter((e) => e.transfer !== false && !e.disabled)
    .flatMap((e) => [...(e.changes ?? []), ...(e.system?.changes ?? [])]);
}

const effectBonus = (ctx, keyPattern) =>
  ctx.effects.filter((c) => keyPattern.test(c.key)).reduce((sum, c) => sum + evalBonus(c.value, ctx), 0);

function abilities(actor, ctx) {
  return Object.fromEntries(
    ABILITY_KEYS.map((k) => {
      const competente = actor.system.abilities[k].proficient >= 1;
      return [k, { valore: actor.system.abilities[k].value, mod: ctx.mods[k], salvezza: ctx.mods[k] + (competente ? ctx.prof : 0), competente }];
    })
  );
}

function skills(actor, ctx) {
  return Object.fromEntries(
    Object.entries(SKILLS).map(([key, [, ability]]) => {
      const data = actor.system.skills[key] ?? {};
      const competenza = data.value ?? 0;
      const bonus = ctx.mods[data.ability || ability] + Math.floor(competenza * ctx.prof);
      return [key, { bonus, competenza }];
    })
  );
}

function hitPoints(actor, ctx) {
  const hp = actor.system.attributes.hp;
  if (typeof hp.max === 'number') return hp.max;
  const rolled = ctx.classes.reduce((sum, { item }) => {
    const die = Number(item.system.hd.denomination.slice(1));
    const advancement = values(item.system.advancement).find((a) => a.type === 'HitPoints');
    return (
      sum +
      Object.values(advancement?.value ?? {}).reduce(
        (s, v) => s + (v === 'max' ? die : v === 'avg' ? die / 2 + 1 : Number(v) || 0),
        0
      )
    );
  }, 0);
  const perLevel = ctx.mods.con + evalBonus(hp.bonuses?.level, ctx);
  return rolled + perLevel * ctx.level + evalBonus(hp.bonuses?.overall, ctx);
}

function armorClass(actor, ctx) {
  const ac = actor.system.attributes.ac;
  if (typeof ac.override === 'number') return ac.override;
  const dex = ctx.mods.dex;
  const equipped = actor.items.filter((i) => i.type === 'equipment' && i.system.equipped);
  const armor = equipped.find((i) => ['light', 'medium', 'heavy'].includes(i.system.type.value));
  const shield = equipped.find((i) => i.system.type.value === 'shield');
  const magic = (item) => evalBonus(item?.system.armor.magicalBonus ?? item?.system.magicalBonus, ctx);

  if (ac.calc === 'flat' || ac.calc === 'natural') return ac.flat ?? 10;
  const formula = {
    mage: () => 13 + dex,
    draconic: () => 13 + dex,
    unarmoredMonk: () => 10 + dex + ctx.mods.wis,
    unarmoredBarb: () => 10 + dex + ctx.mods.con,
  }[ac.calc];

  let value = 10 + dex;
  if (formula) value = formula();
  else if (armor) {
    const type = armor.system.type.value;
    const cap = type === 'medium' ? (armor.system.armor.dex ?? 2) : Infinity;
    value = armor.system.armor.value + (type === 'heavy' ? 0 : Math.min(dex, cap)) + magic(armor);
  }
  if (shield) value += shield.system.armor.value + magic(shield);
  return value + effectBonus(ctx, /attributes\.ac\.bonus$/);
}

function speed(actor, ctx) {
  const own = actor.system.attributes.movement;
  const race = ctx.race?.system.movement;
  const walk = own?.speeds?.walk || race?.speeds?.walk;
  return walk ? `${walk} ${own?.units || race?.units || 'ft'}` : '';
}

function senses(actor, ctx) {
  const ranges = { ...ctx.race?.system.senses?.ranges };
  for (const [k, v] of Object.entries(actor.system.attributes.senses?.ranges ?? {})) if (v) ranges[k] = v;
  const list = Object.entries(ranges)
    .filter(([, v]) => v)
    .map(([k, v]) => `${label(SENSES, k)} ${v} ft`);
  const special = actor.system.attributes.senses?.special;
  return special ? [...list, special] : list;
}

function isProficient(actor, weapon) {
  if (weapon.system.proficient != null) return weapon.system.proficient >= 1;
  const profs = actor.system.traits.weaponProf.value;
  const category = weapon.system.type.value.startsWith('simple') ? 'sim' : 'mar';
  return profs.includes(category) || profs.includes(weapon.system.type.baseItem);
}

const formatBonus = (n) => (n === 0 ? '' : n > 0 ? `+${n}` : `${n}`);

function damageText(part, bonus) {
  if (!part) return '';
  const dice = part.custom?.enabled ? part.custom.formula : part.number && part.denomination ? `${part.number}d${part.denomination}` : '';
  if (!dice) return '';
  const types = (part.types ?? []).join('/');
  return `${dice}${formatBonus(bonus + evalBonus(part.bonus, {}))} ${types}`.trim();
}

function attacks(actor, ctx) {
  return actor.items
    .filter((i) => i.type === 'weapon' && i.system.equipped && i.system.type.baseItem)
    .map((weapon) => {
      const props = weapon.system.properties ?? [];
      const ranged = weapon.system.type.value.endsWith('R');
      const ability = props.includes('fin') ? (ctx.mods.dex > ctx.mods.str ? 'dex' : 'str') : ranged ? 'dex' : 'str';
      const magic = evalBonus(weapon.system.magicalBonus, ctx);
      const mod = ctx.mods[ability] + magic;
      const versatile = props.includes('ver') ? damageText(weapon.system.damage.versatile, mod) : '';
      return {
        nome: weapon.name,
        bonus: mod + (isProficient(actor, weapon) ? ctx.prof : 0),
        danni: damageText(weapon.system.damage.base, mod) + (versatile ? ` (${versatile} two-handed)` : ''),
      };
    });
}

function spellcasting(actor, ctx) {
  const spells = actor.items.filter((i) => i.type === 'spell').filter(listedSpell);
  if (spells.length === 0) return null;
  const ability = actor.system.attributes.spellcasting || 'int';
  const base = ctx.mods[ability] + ctx.prof;
  const progressions = ctx.classes.map(({ item, subclass }) => ({
    levels: item.system.levels,
    progression: [item, subclass].map((i) => i?.system.spellcasting?.progression).find((p) => p && p !== 'none') ?? 'none',
  }));
  const warlock = progressions.filter((c) => c.progression === 'pact').reduce((sum, c) => sum + c.levels, 0);
  return {
    caratteristica: ability,
    cd: 8 + base + evalBonus(actor.system.bonuses?.spell?.dc, ctx) + effectBonus(ctx, /bonuses\.spell\.dc$/),
    attacco: base + evalBonus(actor.system.bonuses?.msak?.attack, ctx) + effectBonus(ctx, /(msak\.bonus|msak\.attack)$/),
    slot: spellSlots(progressions),
    patto: pactSlots(warlock),
    elenco: spells
      .map((s) => ({
        nome: s.name,
        livello: s.system.level,
        preparato: (s.system.prepared ?? 0) >= 1,
        sempre: s.system.level > 0 && (s.system.prepared === 2 || ['innate', 'atwill'].includes(s.system.method)),
        ...usesText(s.system.uses, ctx),
        dettagli: spellDetails(s),
      }))
      .sort((a, b) => a.livello - b.livello || a.nome.localeCompare(b.nome)),
  };
}

// A cleric's sheet holds the whole class list: only what's prepared, granted
// or written in a wizard's spellbook is worth showing.
function listedSpell(spell) {
  const { prepared = 0, method = 'spell', sourceItem = '' } = spell.system;
  return prepared >= 1 || method !== 'spell' || sourceItem.startsWith('race:') || sourceItem === 'class:wizard';
}

function usesText(uses, ctx) {
  if (!uses?.max) return {};
  const max = evalBonus(String(uses.max).replace(/@scale\.([\w-]+\.[\w-]+)/g, (_, key) => String(ctx.scales[key] ?? 0)), ctx);
  if (max <= 0) return {};
  const period = uses.recovery?.[0]?.period;
  return { usi: period ? `${max}/${label(RECOVERY, period)}` : String(max) };
}

function features(actor, ctx) {
  return actor.items
    .filter((i) => i.type === 'feat' && FEATURE_SOURCE[i.system.type?.value] && !FILLER_FEATURES.has(i.name))
    .map((i) => {
      const descrizione = isSrdFeature(i) ? plainText(i.system.description?.value) : '';
      return {
        nome: i.name,
        fonte: FEATURE_SOURCE[i.system.type.value],
        ...usesText(i.system.uses, ctx),
        ...(descrizione ? { descrizione } : {}),
      };
    });
}

function proficiencies(actor) {
  const { traits, tools } = actor.system;
  const custom = (s) => (s ? s.split(/[;,]/).map((x) => x.trim()).filter(Boolean) : []);
  return {
    armature: [...traits.armorProf.value.map((k) => label(ARMOR, k)), ...custom(traits.armorProf.custom)],
    armi: [...traits.weaponProf.value.map((k) => label(WEAPONS, k)), ...custom(traits.weaponProf.custom)],
    strumenti: Object.entries(tools ?? {})
      .filter(([, t]) => t.value >= 1)
      .map(([k]) => label(TOOLS, k)),
    lingue: [...traits.languages.value.map((k) => label(LANGUAGES, k)), ...custom(traits.languages.custom)],
  };
}

const INVENTORY_TYPES = new Set(['weapon', 'equipment', 'consumable', 'tool', 'loot', 'container']);

// Class and background packs often both add a backpack, a tinderbox…: one
// line per name, quantities summed.
function inventory(actor) {
  const byName = new Map();
  for (const i of actor.items) {
    if (!INVENTORY_TYPES.has(i.type) || i.name === 'Unarmed Strike') continue;
    const quantity = i.system.quantity ?? 1;
    const seen = byName.get(i.name);
    if (seen) {
      seen.quantita += quantity;
      continue;
    }
    byName.set(i.name, {
      nome: i.name,
      quantita: quantity,
      magico: (i.system.properties ?? []).includes('mgc'),
      ...(i.system.attunement === 'required' ? { sintonia: Boolean(i.system.attuned) } : {}),
    });
  }
  return [...byName.values()];
}

const coins = (c = {}) => ({ mp: c.pp ?? 0, mo: c.gp ?? 0, me: c.ep ?? 0, ma: c.sp ?? 0, mr: c.cp ?? 0 });
