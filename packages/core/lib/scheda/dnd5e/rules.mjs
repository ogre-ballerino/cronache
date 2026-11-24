// The bits of D&D 5e (2014) arithmetic Foundry derives at runtime and leaves
// out of its exports.

export const modifier = (score) => Math.floor((score - 10) / 2);

export const proficiencyBonus = (level) => Math.ceil(level / 4) + 1;

const FULL_CASTER_SLOTS = [
  [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

const CASTER_LEVEL = {
  full: (level) => level,
  half: (level) => Math.floor(level / 2),
  third: (level) => Math.floor(level / 3),
};

/**
 * Spell slots by spell level for a set of classes, multiclass rules included.
 * @param {{ levels: number, progression: string }[]} classes
 */
export function spellSlots(classes) {
  const casterLevel = classes.reduce((sum, c) => sum + (CASTER_LEVEL[c.progression]?.(c.levels) ?? 0), 0);
  if (casterLevel === 0) return {};
  return Object.fromEntries(FULL_CASTER_SLOTS[casterLevel - 1].map((n, i) => [String(i + 1), n]));
}

/** @param {number} level warlock level */
export function pactSlots(level) {
  if (level < 1) return null;
  const slots = level >= 17 ? 4 : level >= 11 ? 3 : level >= 2 ? 2 : 1;
  return { livello: Math.min(5, Math.ceil(level / 2)), slot: slots };
}

/**
 * Evaluates the simple formulas found in effects and bonuses ("+1",
 * "@abilities.cha.mod", "2 + @prof"). Dice and anything else resolve to 0.
 */
export function evalBonus(value, { mods, prof }) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const expr = String(value)
    .replace(/@abilities\.(\w+)\.mod/g, (_, key) => String(mods[key] ?? 0))
    .replace(/@prof/g, String(prof))
    .replace(/\s+/g, '');
  if (!/^[+-]?\d+([+-]\d+)*$/.test(expr)) return 0;
  return expr.match(/[+-]?\d+/g).reduce((sum, n) => sum + Number(n), 0);
}
