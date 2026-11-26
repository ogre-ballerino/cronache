import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { coinList, itemsTakenBy } from '../lib/loot.mjs';

describe('coinList', () => {
  it('orders coins from platinum to copper and drops empty ones', () => {
    assert.deepEqual(
      coinList({ mr: 3, mo: 50, ma: 0 }).map((c) => `${c.amount} ${c.key}`),
      ['50 mo', '3 mr']
    );
    assert.deepEqual(coinList(), []);
  });
});

describe('itemsTakenBy', () => {
  it("lists one holder's items in session order, skipping shared loot", () => {
    const sessions = [
      { id: 's-07', numero: 7, bottino: { oggetti: [{ nome: 'Elsa', chi: 'Artemis' }, { nome: 'Pozione', chi: 'Erieth' }] } },
      { id: 's-02', numero: 2, bottino: { oggetti: [{ nome: 'Carro' }, { nome: 'Statuetta', chi: 'artemis' }] } },
      { id: 's-03', numero: 3 },
    ];
    assert.deepEqual(
      itemsTakenBy(sessions, (chi) => chi.toLowerCase() === 'artemis'),
      [
        { nome: 'Statuetta', session: 's-02', numero: 2 },
        { nome: 'Elsa', session: 's-07', numero: 7 },
      ]
    );
  });
});
