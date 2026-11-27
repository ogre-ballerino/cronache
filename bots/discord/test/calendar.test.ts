import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ics } from '../src/calendar.ts';
import { feed } from '../src/feed.ts';

const now = Date.parse('2026-11-27T12:00:00Z');
const start = Date.parse('2026-11-28T16:30:00Z');
const lines = (s: string) => s.split('\r\n');

describe('ics', () => {
  it('writes a three-hour event for a session with a time', () => {
    assert.equal(
      ics([{ uid: `strahd-${start}`, start, title: 'Curse of Strahd' }], 'Curse of Strahd', now),
      [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ogreballerino//cronache-bot//IT',
        'X-WR-CALNAME:Curse of Strahd',
        'BEGIN:VEVENT',
        `UID:strahd-${start}`,
        'DTSTAMP:20261127T120000Z',
        'DTSTART:20261128T163000Z',
        'DTEND:20261128T193000Z',
        'SUMMARY:Curse of Strahd',
        'END:VEVENT',
        'END:VCALENDAR',
        '',
      ].join('\r\n'),
    );
  });

  it('writes an all-day event for a day, with its link', () => {
    const out = lines(ics([{ uid: 'strahd-2026-12-31', start: '2026-12-31', title: 'Curse of Strahd · Fine', url: 'https://x/' }], 'C', now));
    assert.ok(out.includes('DTSTART;VALUE=DATE:20261231'));
    assert.ok(out.includes('DTEND;VALUE=DATE:20270101'));
    assert.ok(out.includes('DESCRIPTION:https://x/'));
    assert.ok(!out.some((l) => l.startsWith('URL:')));
  });

  it('escapes commas and semicolons in text', () => {
    assert.ok(lines(ics([{ uid: 'u', start, title: 'Sangue, vino; e poi' }], 'C', now)).includes('SUMMARY:Sangue\\, vino\\; e poi'));
  });
});

describe('feed', () => {
  const journal = [
    { date: '2026-11-28', title: 'Il ballo', url: 'https://ombre/diario/sessione-12/' },
    { date: '2026-11-14', title: 'La lettera', url: 'https://ombre/diario/sessione-11/' },
  ];

  it('adds the journal sessions that never went through /next as all-day events', () => {
    assert.deepEqual(feed('ombre', 'Ombre', 'Europe/London', [], journal), [
      { uid: 'ombre-2026-11-28', start: '2026-11-28', title: 'Ombre · Il ballo', url: journal[0].url },
      { uid: 'ombre-2026-11-14', start: '2026-11-14', title: 'Ombre · La lettera', url: journal[1].url },
    ]);
  });

  it('keeps the time of a session set with /next, and gives it the journal title of that day', () => {
    assert.deepEqual(feed('ombre', 'Ombre', 'Europe/London', [{ uid: `ombre-${start}`, start }], journal), [
      { uid: 'ombre-2026-11-14', start: '2026-11-14', title: 'Ombre · La lettera', url: journal[1].url },
      { uid: `ombre-${start}`, start, title: 'Ombre · Il ballo', url: journal[0].url },
    ]);
  });

  it('names a session not yet written up after the campaign', () => {
    const events = feed('ombre', 'Ombre', 'Europe/London', [{ uid: 'u', start: Date.parse('2026-12-05T16:30:00Z') }], journal);
    assert.equal(events.find((e) => e.uid === 'u')?.title, 'Ombre');
  });

  it('matches the day on the campaign clock, not in UTC', () => {
    const late = Date.parse('2026-07-03T23:30:00Z');
    const [event] = feed('s', 'S', 'Europe/London', [{ uid: 'u', start: late }], [{ date: '2026-07-04', title: 'Notte', url: 'u' }]);
    assert.equal(event.title, 'S · Notte');
  });
});

describe('feed slot', () => {
  it("puts the journal sessions in the campaign's usual slot, on its clock", () => {
    const [event] = feed('strahd', 'S', 'Europe/London', [], [{ date: '2026-07-01', title: 'Notte', url: 'u' }], { start: '21:00', hours: 3 });
    assert.equal(event.start, Date.parse('2026-07-01T20:00:00Z'));
    assert.equal(event.end, Date.parse('2026-07-01T23:00:00Z'));
    assert.ok(ics([event], 'S', 0).includes('DTEND:20260701T230000Z'));
  });
});
