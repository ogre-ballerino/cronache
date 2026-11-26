import { DurableObject } from 'cloudflare:workers';
import { announcement, postToDiscord, sameSession } from './annuncio.ts';
import { readBot } from './bot.ts';

// One per campaign: remembers what was announced (and, later, the next session and its alarms).
export class Campagna extends DurableObject<Env> {
  async announce(site: string, webhook: string): Promise<string> {
    const bot = await readBot(site);
    if (!bot.ultima) return 'no sessions yet';
    const last = await this.ctx.storage.get<string>('annunciata');
    if (sameSession(last, bot.ultima.url)) return 'already announced';
    // The first deploy after setup only records the current session: it was announced before the bot existed.
    if (last !== undefined) await postToDiscord(webhook, announcement({ ...bot, ultima: bot.ultima }));
    await this.ctx.storage.put('annunciata', bot.ultima.url);
    return last === undefined ? `recorded ${bot.ultima.url}` : `announced ${bot.ultima.url}`;
  }
}
