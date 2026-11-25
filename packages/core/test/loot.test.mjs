import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { coinList } from '../lib/loot.mjs';

describe('coinList', () => {
  it('orders coins from platinum to copper and drops empty ones', () => {
    assert.deepEqual(
      coinList({ mr: 3, mo: 50, ma: 0 }).map((c) => `${c.amount} ${c.key}`),
      ['50 mo', '3 mr']
    );
    assert.deepEqual(coinList(), []);
  });
});
