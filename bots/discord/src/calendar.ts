export const SESSION_HOURS = 3;

export interface Session {
  uid: string;
  start: number;
}

// The iCloud account, and the calendar of a campaign that has one (ICLOUD_CALENDAR_URL_<CAMPAIGN>).
export interface ICloud {
  user: string;
  password: string;
  calendar: string;
}

// `start`: an instant for a session set with /next, a 'YYYY-MM-DD' day for one known only from the journal.
export interface CalendarEvent {
  uid: string;
  start: number | string;
  end?: number;
  title: string;
  url?: string;
}

const icsUtc = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsDay = (day: string, plus = 0) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + plus)).toISOString().slice(0, 10).replace(/-/g, '');
};
const escapeText = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

const vevent = ({ uid, start, end, title, url }: CalendarEvent, now: number) => [
  'BEGIN:VEVENT',
  `UID:${uid}`,
  `DTSTAMP:${icsUtc(now)}`,
  ...(typeof start === 'number'
    ? [`DTSTART:${icsUtc(start)}`, `DTEND:${icsUtc(end ?? start + SESSION_HOURS * 3_600_000)}`]
    : [`DTSTART;VALUE=DATE:${icsDay(start)}`, `DTEND;VALUE=DATE:${icsDay(start, 1)}`]),
  `SUMMARY:${escapeText(title)}`,
  ...(url ? [`URL:${url}`, `DESCRIPTION:${escapeText(url)}`] : []),
  'END:VEVENT',
];

// One calendar: a single event for iCloud, every session for the subscribable feed.
export function ics(events: CalendarEvent[], name: string, now = Date.now()) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ogreballerino//cronache-bot//IT',
    `X-WR-CALNAME:${escapeText(name)}`,
    ...events.flatMap((e) => vevent(e, now)),
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

async function caldav(icloud: ICloud, method: 'PUT' | 'DELETE', uid: string, body?: string) {
  const res = await fetch(new URL(`${uid}.ics`, icloud.calendar.replace(/\/?$/, '/')), {
    method,
    headers: {
      Authorization: `Basic ${btoa(`${icloud.user}:${icloud.password}`)}`,
      ...(body && { 'Content-Type': 'text/calendar; charset=utf-8' }),
    },
    body,
  });
  // A 404 on delete: the event was already removed by hand.
  if (!res.ok && !(method === 'DELETE' && res.status === 404)) {
    throw new Error(`iCloud ${method}: HTTP ${res.status} ${await res.text()}`);
  }
}

export const saveEvent = (icloud: ICloud, session: Session, title: string) =>
  caldav(icloud, 'PUT', session.uid, ics([{ ...session, title }], title));
export const deleteEvent = (icloud: ICloud, uid: string) => caldav(icloud, 'DELETE', uid);
