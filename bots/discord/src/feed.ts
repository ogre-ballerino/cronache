import type { Bot } from './bot.ts';
import type { CalendarEvent, Session } from './calendar.ts';

const day = (ms: number, timezone: string) => new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(ms);

// The campaign's public calendar: the sessions set with /next, at their time, plus every session in the journal
// that never went through /next, as an all-day event. A session in the journal gets its title, after `event` so
// it reads on its own in a notification, and a link to its page.
export function feed(
  campaign: string,
  event: string,
  timezone: string,
  sessions: Session[],
  journal: Bot['sessions'] = [],
): CalendarEvent[] {
  const byDay = new Map(journal.map((j) => [j.date, j]));
  const scheduled = sessions.map((s) => {
    const j = byDay.get(day(s.start, timezone));
    return { uid: s.uid, start: s.start, title: j ? `${event} · ${j.title}` : event, url: j?.url };
  });
  const covered = new Set(sessions.map((s) => day(s.start, timezone)));
  const journalOnly = journal
    .filter((j) => !covered.has(j.date))
    .map((j) => ({ uid: `${campaign}-${j.date}`, start: j.date, title: `${event} · ${j.title}`, url: j.url }));
  return [...journalOnly, ...scheduled];
}
