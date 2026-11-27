import type { Bot } from './bot.ts';
import type { Session } from './calendar.ts';
import { fullTime } from './discord.ts';

const HOUR = 3_600_000;

export type Kind = 'letter' | 'recap';

export const REMINDERS: { kind: Kind; before: number }[] = [
  { kind: 'letter', before: 24 * HOUR },
  { kind: 'recap', before: 3 * HOUR },
];

const at = (session: Session, before: number) => session.start - before;

// Only the reminders that fell after the date was set: a session set at short notice skips the letter.
export const due = (session: Session, scheduledAt: number, now: number) =>
  REMINDERS.filter(({ before }) => at(session, before) > scheduledAt && at(session, before) <= now).map((r) => r.kind);

export function nextAlarm(session: Session | undefined, now: number): number | undefined {
  if (!session) return undefined;
  return REMINDERS.map(({ before }) => at(session, before)).find((t) => t > now);
}

const nextSessionField = (start: number) => ({ name: 'Prossima sessione', value: fullTime(start) });

// What players read, from the latest journal entry. Null when there is nothing to post.
export function reminder(kind: Kind, bot: Bot, start: number) {
  const latest = bot.latest;
  if (!latest) return null;
  if (kind === 'letter') {
    if (!bot.letter || !latest.letter) return null;
    return {
      embeds: [
        { title: bot.letter.title, description: latest.letter, color: bot.color, fields: [nextSessionField(start)], footer: { text: bot.letter.footer } },
      ],
    };
  }
  return {
    embeds: [
      {
        title: '📜 Nella puntata precedente…',
        url: latest.url,
        description: `${latest.recap ?? latest.excerpt}\n\n[${bot.readMore}](${latest.url})`.trim(),
        color: bot.color,
        fields: [nextSessionField(start)],
        footer: { text: `${latest.label} · ${latest.title}` },
      },
    ],
  };
}
