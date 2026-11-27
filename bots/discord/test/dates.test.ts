import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { toInstant, parseDate, parseTime, suggestDates, suggestTimes } from '../src/dates.ts';

const LONDON = 'Europe/London';
const today = Date.parse('2026-11-27T12:00:00Z');

describe('toInstant', () => {
  it('reads the time on the London clock, in winter and in summer', () => {
    assert.equal(new Date(toInstant({ y: 2026, m: 11, d: 28 }, { h: 16, mi: 30 }, LONDON)).toISOString(), '2026-11-28T16:30:00.000Z');
    assert.equal(new Date(toInstant({ y: 2027, m: 7, d: 3 }, { h: 16, mi: 30 }, LONDON)).toISOString(), '2027-07-03T15:30:00.000Z');
  });

  it('works across the clock change', () => {
    assert.equal(new Date(toInstant({ y: 2027, m: 3, d: 28 }, { h: 21, mi: 0 }, LONDON)).toISOString(), '2027-03-28T20:00:00.000Z');
  });
});

describe('parseDate', () => {
  it('reads the value sent by a suggestion', () => {
    assert.deepEqual(parseDate('2026-11-28', today, LONDON), { y: 2026, m: 11, d: 28 });
  });

  it('reads day/month the Italian way, with any separator', () => {
    for (const text of ['28/11', '28-11', '28.11', ' 28/11 ']) assert.deepEqual(parseDate(text, today, LONDON), { y: 2026, m: 11, d: 28 });
    assert.deepEqual(parseDate('3/1/27', today, LONDON), { y: 2027, m: 1, d: 3 });
  });

  it('without a year, picks the next one', () => {
    assert.deepEqual(parseDate('3/1', today, LONDON), { y: 2027, m: 1, d: 3 });
    assert.deepEqual(parseDate('27/11', today, LONDON), { y: 2026, m: 11, d: 27 });
  });

  it('rejects dates that do not exist and other text', () => {
    for (const text of ['31/11', '29/2/27', 'sabato', '', '11/28/2026']) assert.equal(parseDate(text, today, LONDON), null);
  });
});

describe('parseTime', () => {
  it('reads the usual ways of writing a time', () => {
    assert.deepEqual(parseTime('16:30'), { h: 16, mi: 30 });
    assert.deepEqual(parseTime('16.30'), { h: 16, mi: 30 });
    assert.deepEqual(parseTime('16h30'), { h: 16, mi: 30 });
    assert.deepEqual(parseTime('9'), { h: 9, mi: 0 });
  });

  it('rejects impossible times', () => {
    for (const text of ['24:00', '16:60', '16:3', 'sera']) assert.equal(parseTime(text), null);
  });
});

describe('suggestDates', () => {
  it('lists the next days from today, in Italian', () => {
    const choices = suggestDates(today, LONDON);
    assert.equal(choices.length, 25);
    assert.deepEqual(choices[0], { name: 'ven 27/11', value: '2026-11-27' });
    assert.deepEqual(choices[1], { name: 'sab 28/11', value: '2026-11-28' });
  });

  it('filters by what has been typed', () => {
    assert.deepEqual(
      suggestDates(today, LONDON, 'sab').map((s) => s.value),
      ['2026-11-28', '2026-12-05', '2026-12-12', '2026-12-19'],
    );
  });
});

describe('suggestTimes', () => {
  it('puts the last time used first, without repeating it', () => {
    assert.deepEqual(suggestTimes('20:30').map((s) => s.value), ['20:30', '16:30', '21:00', '15:00']);
    assert.deepEqual(suggestTimes(undefined, '21').map((s) => s.value), ['21:00']);
  });
});
