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

/**
 * The items a holder took, in session order.
 * @param {{ id: string, numero: number, bottino?: { oggetti: { nome: string, chi?: string }[] } }[]} sessions
 * @param {(chi: string) => boolean} isHolder
 */
export const itemsTakenBy = (sessions, isHolder) =>
  [...sessions]
    .sort((a, b) => a.numero - b.numero)
    .flatMap(({ id, numero, bottino }) =>
      (bottino?.oggetti ?? []).filter(({ chi }) => chi && isHolder(chi)).map(({ nome }) => ({ nome, session: id, numero }))
    );
