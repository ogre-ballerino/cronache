// A spell's technical details from Foundry's structured data only: the
// books' prose never makes it to the site. Terms in English, as on Foundry.

const SCHOOLS = {
  abj: 'Abjuration',
  con: 'Conjuration',
  div: 'Divination',
  enc: 'Enchantment',
  evo: 'Evocation',
  ill: 'Illusion',
  nec: 'Necromancy',
  trs: 'Transmutation',
};

const count = (n, unit) => `${n} ${unit}${Number(n) === 1 ? '' : 's'}`;

const ACTIVATION = {
  action: (n) => count(n, 'action'),
  bonus: () => '1 bonus action',
  reaction: () => '1 reaction',
  minute: (n) => count(n, 'minute'),
  hour: (n) => count(n, 'hour'),
};

const DURATION = {
  inst: () => 'Instantaneous',
  turn: (n) => count(n, 'turn'),
  round: (n) => count(n, 'round'),
  minute: (n) => count(n, 'minute'),
  hour: (n) => count(n, 'hour'),
  day: (n) => count(n, 'day'),
  perm: () => 'Permanent',
  disp: () => 'Until dispelled',
  spec: () => 'Special',
};

const SAVES = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };

// Scaled values ("30 + (@scaling.increase * 5)") keep their base number.
const baseNumber = (v) => String(v ?? '').match(/^\s*(\d+)/)?.[1] ?? '';

function casting({ activation = {} }) {
  const format = ACTIVATION[activation.type];
  const text = format ? format(activation.value || 1) : activation.type ?? '';
  return activation.condition ? `${text}, ${activation.condition}` : text;
}

function range({ range = {}, target = {} }) {
  const value = baseNumber(range.value);
  const base =
    { self: 'Self', touch: 'Touch', spec: 'Special', any: 'Unlimited' }[range.units] ??
    (value ? `${value} ${range.units === 'mi' ? 'miles' : range.units}` : '');
  const t = target.template ?? {};
  const size = baseNumber(t.size);
  const area = t.type && size ? `${size}-${t.units === 'm' ? 'meter' : 'foot'} ${t.type}` : '';
  return [base, area && `(${area})`].filter(Boolean).join(' ');
}

function components({ properties = [], materials = {} }) {
  const list = [['vocal', 'V'], ['somatic', 'S'], ['material', 'M']].filter(([p]) => properties.includes(p)).map(([, c]) => c);
  const cost = materials.cost ? ` (${materials.cost} gp${materials.consumed ? ', consumed' : ''})` : '';
  return list.join(', ') + (list.includes('M') ? cost : '');
}

function duration({ duration = {}, properties = [] }) {
  const format = DURATION[duration.units];
  const text = format ? format(baseNumber(duration.value) || 1) : '';
  return properties.includes('concentration') ? `Concentration, up to ${text}` : text;
}

const formula = (part) => {
  if (part.custom?.enabled) return part.custom.formula.replace(/@mod/g, 'mod').replace(/\s+/g, '');
  if (!part.number || !part.denomination) return '';
  return `${part.number}d${part.denomination}${part.bonus ? `+${String(part.bonus).replace(/@mod/g, 'mod').replace(/^\+/, '')}` : ''}`;
};

function effect({ activities = {} }) {
  const parts = Object.values(activities).flatMap((a) => {
    const out = [];
    if (a.type === 'attack' && a.attack?.type) {
      out.push(a.attack.type.value === 'melee' ? 'melee spell attack' : 'ranged spell attack');
    }
    if (a.type === 'save' && a.save?.ability?.length) out.push(`${a.save.ability.map((k) => SAVES[k] ?? k).join('/')} save`);
    for (const part of a.damage?.parts ?? []) {
      const dice = formula(part);
      if (dice) out.push(`${dice} ${(part.types ?? []).join('/')}`.trim());
    }
    if (a.healing) {
      const dice = formula(a.healing);
      if (dice) out.push(`heals ${dice}`);
    }
    return out;
  });
  return [...new Set(parts)].join(', ');
}

/** Short strings for a spell's tooltip, keyed by the label shown; empty ones are dropped. */
export function spellDetails(spell) {
  const s = spell.system;
  const details = {
    school: SCHOOLS[s.school] ?? s.school ?? '',
    casting: casting(s),
    range: range(s),
    components: components(s),
    duration: duration(s),
    effect: effect(s),
    ritual: (s.properties ?? []).includes('ritual') ? 'yes' : '',
  };
  return Object.fromEntries(Object.entries(details).filter(([, v]) => v));
}
