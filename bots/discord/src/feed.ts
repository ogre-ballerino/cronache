import type { Bot } from './bot.ts';
import type { CalendarEvent, Session } from './calendar.ts';
import { parseTime, toInstant } from './dates.ts';

// When the campaign usually plays, for the journal sessions whose time was never set: e.g. 21:00 for 3 hours.
export interface Slot {
  start: string;
  hours: number;
}

const day = (ms: number, timezone: string) => new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(ms);

// The campaign's public calendar: the sessions set with /next, at their time, plus every session in the journal
// that never went through /next, in the campaign's usual slot (all day without one). A session in the journal gets its title, after `event` so
// it reads on its own in a notification, and a link to its page.
export function feed(
  campaign: string,
  event: string,
  timezone: string,
  sessions: Session[],
  journal: Bot['sessions'] = [],
  slot?: Slot,
): CalendarEvent[] {
  const byDay = new Map(journal.map((j) => [j.date, j]));
  const scheduled = sessions.map((s) => {
    const j = byDay.get(day(s.start, timezone));
    return { uid: s.uid, start: s.start, title: j ? `${event} · ${j.title}` : event, url: j?.url };
  });
  const covered = new Set(sessions.map((s) => day(s.start, timezone)));
  const journalOnly = journal
    .filter((j) => !covered.has(j.date))
    .map((j) => ({ uid: `${campaign}-${j.date}`, ...when(j.date, timezone, slot), title: `${event} · ${j.title}`, url: j.url }));
  return [...journalOnly, ...scheduled];
}

function when(date: string, timezone: string, slot?: Slot) {
  const time = slot && parseTime(slot.start);
  if (!slot || !time) return { start: date };
  const [y, m, d] = date.split('-').map(Number);
  const start = toInstant({ y, m, d }, time, timezone);
  return { start, end: start + slot.hours * 3_600_000 };
}
