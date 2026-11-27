import { DurableObject } from 'cloudflare:workers';
import { announcement, postToDiscord, sameSession } from './announcement.ts';
import { readBot, type Bot } from './bot.ts';
import type { Session } from './calendar.ts';
import { due, nextAlarm, reminder, type Kind } from './reminders.ts';
import { settings, webhook, type Secrets } from './settings.ts';

// One per campaign: remembers what was announced, and every session date set with /next.
// Its alarm posts the letter and the recap before the next session.
export class Campaign extends DurableObject<Env> {
  // The alarm may run without the name it was reached by, so it's kept; a date set before the reminders existed
  // gets its alarm on the first request.
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      if (ctx.id.name && (await ctx.storage.get('name')) !== ctx.id.name) await ctx.storage.put('name', ctx.id.name);
      if ((await ctx.storage.getAlarm()) === null) await this.arm();
    });
  }

  async announce(site: string, webhook: string): Promise<string> {
    const bot = await readBot(site);
    if (!bot.latest) return 'no sessions yet';
    const last = await this.ctx.storage.get<string>('announced');
    if (sameSession(last, bot.latest.url)) return 'already announced';
    // The first deploy after setup only records the current session: it was announced before the bot existed.
    if (last !== undefined) await postToDiscord(webhook, announcement({ ...bot, latest: bot.latest }));
    await this.ctx.storage.put('announced', bot.latest.url);
    return last === undefined ? `recorded ${bot.latest.url}` : `announced ${bot.latest.url}`;
  }

  async sessions(): Promise<Session[]> {
    return (await this.ctx.storage.get<Session[]>('sessions')) ?? [];
  }

  async next(): Promise<Session | undefined> {
    const now = Date.now();
    return (await this.sessions()).find((s) => s.start > now);
  }

  async lastTime(): Promise<string | undefined> {
    return this.ctx.storage.get<string>('time');
  }

  // A new date replaces the one still to come, returned so its calendar event can go too; past sessions stay,
  // as the calendar's history.
  async schedule(session: Session, time: string): Promise<Session[]> {
    const now = Date.now();
    const [past, upcoming] = partition(await this.sessions(), (s) => s.start <= now);
    await this.ctx.storage.put({ sessions: [...past, session], time, scheduledAt: now });
    await this.arm();
    return upcoming.filter((s) => s.uid !== session.uid);
  }

  // Only a session still to come can be cancelled.
  async cancel(uid: string): Promise<Session | null> {
    const sessions = await this.sessions();
    const session = sessions.find((s) => s.uid === uid && s.start > Date.now());
    if (!session) return null;
    await this.ctx.storage.put('sessions', sessions.filter((s) => s !== session));
    await this.arm();
    return session;
  }

  async alarm() {
    const session = await this.next();
    const name = await this.ctx.storage.get<string>('name');
    const c = name && settings(name);
    const hook = name && webhook(this.env as Env & Secrets, name);
    if (session && c && hook) {
      const scheduledAt = (await this.ctx.storage.get<number>('scheduledAt')) ?? 0;
      const kinds = due(session, scheduledAt, Date.now());
      // A failure throws, and Cloudflare retries the alarm; what was posted is remembered, so it isn't posted twice.
      if (kinds.length) {
        const bot = await readBot(c.site);
        for (const kind of kinds) await this.remind(kind, bot, session.start, hook);
      }
    }
    await this.arm();
  }

  // Each journal entry's letter and recap are posted once: if the journal hasn't caught up with the last session,
  // nothing is better than the previous one again.
  private async remind(kind: Kind, bot: Bot, start: number, hook: string) {
    const url = bot.latest?.url;
    const reminded = (await this.ctx.storage.get<Partial<Record<Kind, string>>>('reminded')) ?? {};
    if (!url || sameSession(reminded[kind], url)) return;
    const message = reminder(kind, bot, start);
    if (message) await postToDiscord(hook, message);
    await this.ctx.storage.put('reminded', { ...reminded, [kind]: url });
  }

  private async arm() {
    const at = nextAlarm(await this.next(), Date.now());
    if (at) await this.ctx.storage.setAlarm(at);
    else await this.ctx.storage.deleteAlarm();
  }
}

function partition<T>(items: T[], test: (item: T) => boolean): [T[], T[]] {
  return [items.filter(test), items.filter((item) => !test(item))];
}
