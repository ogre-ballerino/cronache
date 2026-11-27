import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { due, nextAlarm, reminder } from '../src/reminders.ts';

const HOUR = 3_600_000;
const start = Date.UTC(2026, 10, 28, 16, 30);
const session = { uid: 'ombre-1', start };

const bot = {
  announcement: '🦇',
  readMore: 'Leggi il diario',
  color: 0x6b4f2a,
  letter: { title: '🦇 Una lettera dal Castello Ravenloft', footer: 'Strahd von Zarovich' },
  latest: {
    url: 'https://strahd.ogreballerino.com/diario/sessione-12/',
    title: 'La danza',
    label: 'Sessione XII',
    date: '28 ottobre 2026',
    excerpt: 'Il gruppo lascia Vallaki.',
    image: '',
    letter: 'Vi attendo.\n\nS.',
    recap: 'La nebbia si chiude.',
  },
};

describe('due', () => {
  it('posts the letter a day before and the recap three hours before', () => {
    const setAt = start - 7 * 24 * HOUR;
    assert.deepEqual(due(session, setAt, start - 25 * HOUR), []);
    assert.deepEqual(due(session, setAt, start - 24 * HOUR), ['letter']);
    assert.deepEqual(due(session, setAt, start - 3 * HOUR), ['letter', 'recap']);
  });

  it('skips the letter for a session set at short notice', () => {
    assert.deepEqual(due(session, start - 10 * HOUR, start - 3 * HOUR), ['recap']);
  });
});

describe('nextAlarm', () => {
  it('wakes for the next reminder still to come', () => {
    assert.equal(nextAlarm(session, start - 48 * HOUR), start - 24 * HOUR);
    assert.equal(nextAlarm(session, start - 24 * HOUR), start - 3 * HOUR);
    assert.equal(nextAlarm(session, start - 2 * HOUR), undefined);
    assert.equal(nextAlarm(undefined, start), undefined);
  });
});

describe('reminder', () => {
  it('posts the letter with its campaign title and the session date', () => {
    const [embed] = reminder('letter', bot, start)!.embeds;
    assert.equal(embed.title, '🦇 Una lettera dal Castello Ravenloft');
    assert.equal(embed.description, 'Vi attendo.\n\nS.');
    assert.deepEqual(embed.fields, [{ name: 'Prossima sessione', value: `<t:${start / 1000}:F>` }]);
  });

  it('has no letter without the campaign letter or the session text', () => {
    assert.equal(reminder('letter', { ...bot, letter: undefined }, start), null);
    assert.equal(reminder('letter', { ...bot, latest: { ...bot.latest, letter: undefined } }, start), null);
  });

  it('falls back to the excerpt for the recap', () => {
    const [embed] = reminder('recap', { ...bot, latest: { ...bot.latest, recap: undefined } }, start)!.embeds;
    assert.equal(embed.description, `Il gruppo lascia Vallaki.\n\n[Leggi il diario](${bot.latest.url})`);
    assert.equal(embed.footer.text, 'Sessione XII · La danza');
  });
});
