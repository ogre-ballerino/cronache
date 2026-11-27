// Dates as the group types them ("28/11", "16:30"), read in the campaign's timezone.
export interface Day {
  y: number;
  m: number;
  d: number;
}

export interface Time {
  h: number;
  mi: number;
}

function wallClock(t: number, timezone: string): Day & Time {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).formatToParts(t);
  const n = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { y: n('year'), m: n('month'), d: n('day'), h: n('hour'), mi: n('minute') };
}

const offset = (t: number, timezone: string) => {
  const w = wallClock(t, timezone);
  return Date.UTC(w.y, w.m - 1, w.d, w.h, w.mi) - (t - (t % 60_000));
};

// The instant at which the clock in `timezone` reads this day and time.
export function toInstant({ y, m, d }: Day, { h, mi }: Time, timezone: string): number {
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const first = guess - offset(guess, timezone);
  return guess - offset(first, timezone);
}

const isRealDay = ({ y, m, d }: Day) => {
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
};

// "2026-11-28" (what the suggestions send), "28/11", "28/11/2026", "28-11", "28.11.26".
// Without a year, the next 28/11 from today.
export function parseDate(text: string, now: number, timezone: string): Day | null {
  const iso = text.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const dmy = text.trim().match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2}|\d{4}))?$/);
  let day: Day;
  if (iso) day = { y: +iso[1], m: +iso[2], d: +iso[3] };
  else if (dmy) {
    const today = wallClock(now, timezone);
    const y = dmy[3] ? (dmy[3].length === 2 ? 2000 + +dmy[3] : +dmy[3]) : today.y;
    day = { y, m: +dmy[2], d: +dmy[1] };
    const passed = day.m < today.m || (day.m === today.m && day.d < today.d);
    if (!dmy[3] && passed) day.y++;
  } else return null;
  return isRealDay(day) ? day : null;
}

// "16:30", "16.30", "16h30", "16".
export function parseTime(text: string): Time | null {
  const match = text.trim().match(/^(\d{1,2})(?:[:.h](\d{2}))?$/);
  if (!match) return null;
  const time = { h: +match[1], mi: +(match[2] ?? 0) };
  return time.h < 24 && time.mi < 60 ? time : null;
}

export const formatTime = ({ h, mi }: Time) => `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;

export interface Choice {
  name: string;
  value: string;
}

const matches = (typed: string) => (c: Choice) => c.name.toLowerCase().includes(typed.trim().toLowerCase());

// The next 25 days (Discord's limit), "sab 28/11" (the players' language), filtered by what's been typed so far.
export function suggestDates(now: number, timezone: string, typed = ''): Choice[] {
  const today = wallClock(now, timezone);
  const weekday = new Intl.DateTimeFormat('it-IT', { weekday: 'short', timeZone: 'UTC' });
  return Array.from({ length: 25 }, (_, i) => {
    const t = new Date(Date.UTC(today.y, today.m - 1, today.d + i));
    const [y, m, d] = [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()];
    const pad = (n: number) => String(n).padStart(2, '0');
    return { name: `${weekday.format(t)} ${pad(d)}/${pad(m)}`, value: `${y}-${pad(m)}-${pad(d)}` };
  }).filter(matches(typed));
}

const USUAL_TIMES = ['16:30', '20:30', '21:00', '15:00'];

// The time used last time first, then the usual ones.
export function suggestTimes(last: string | undefined, typed = ''): Choice[] {
  return [...new Set([last, ...USUAL_TIMES].filter((t): t is string => !!t))]
    .map((t) => ({ name: t, value: t }))
    .filter(matches(typed));
}
