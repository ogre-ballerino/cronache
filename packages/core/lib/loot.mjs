// D&D 5e denominations, most valuable first, with their Italian abbreviations and names.
export const COINS = [
  ['mp', 'Monete di platino'],
  ['mo', "Monete d'oro"],
  ['me', 'Monete di electrum'],
  ['ma', "Monete d'argento"],
  ['mr', 'Monete di rame'],
];

/** @param {Partial<Record<string, number>>} [monete] */
export const coinList = (monete = {}) =>
  COINS.filter(([key]) => monete[key]).map(([key, name]) => ({ key, name, amount: monete[key] }));
