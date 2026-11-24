import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { toRoman, seasonTitle } from '../lib/format.ts';
import { groupBySeason } from '../lib/seasons.ts';

describe('toRoman', () => {
  it('converts session numbers', () => {
    assert.deepEqual([1, 4, 9, 14, 40, 1999].map(toRoman), ['I', 'IV', 'IX', 'XIV', 'XL', 'MCMXCIX']);
  });
});

describe('groupBySeason', () => {
  const session = (numero, stagione) => ({ data: { numero, stagione } });

  it('groups newest season and session first', () => {
    const groups = groupBySeason([session(1, 1), session(3, 2), session(2, 1)]);
    assert.deepEqual(
      groups.map((g) => [g.stagione, g.sessions.map((s) => s.data.numero)]),
      [
        [2, [3]],
        [1, [2, 1]],
      ]
    );
  });

  it('returns one group without a season when the campaign has none', () => {
    const groups = groupBySeason([session(1), session(2)]);
    assert.deepEqual(groups.map((g) => g.stagione), [undefined]);
  });
});

describe('seasonTitle', () => {
  const config = { labels: { season: 'Avventura' }, seasons: { 1: 'Genius Loci' } };

  it('uses the configured title, else the label and a roman numeral', () => {
    assert.equal(seasonTitle(1, config), 'Genius Loci');
    assert.equal(seasonTitle(2, config), 'Avventura II');
  });
});
