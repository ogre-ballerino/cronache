import { DurableObject } from 'cloudflare:workers';
import { announcement, postToDiscord, sameSession } from './announcement.ts';
import { readBot } from './bot.ts';
import type { Session } from './calendar.ts';

// One per campaign: remembers what was announced, and every session date set with /next.
export class Campaign extends DurableObject<Env> {
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
    await this.ctx.storage.put({ sessions: [...past, session], time });
    return upcoming.filter((s) => s.uid !== session.uid);
  }

  // Only a session still to come can be cancelled.
  async cancel(uid: string): Promise<Session | null> {
    const sessions = await this.sessions();
    const session = sessions.find((s) => s.uid === uid && s.start > Date.now());
    if (!session) return null;
    await this.ctx.storage.put('sessions', sessions.filter((s) => s !== session));
    return session;
  }
}

function partition<T>(items: T[], test: (item: T) => boolean): [T[], T[]] {
  return [items.filter(test), items.filter((item) => !test(item))];
}
