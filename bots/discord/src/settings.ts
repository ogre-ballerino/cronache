import type { ICloud } from './calendar.ts';
import { CAMPAIGNS } from './campaigns.ts';

// A campaign's bot settings, from its site's campaign.config.mjs (scripts/campaigns.ts).
export interface CampaignSettings {
  site: string;
  title: string;
  channel: string;
  event: string;
  signature: string;
  timezone: string;
}

export type Secrets = { NETLIFY_JWS_SECRET: string; ICLOUD_USER?: string; ICLOUD_PASSWORD?: string } & Record<
  `DISCORD_WEBHOOK_${string}` | `ICLOUD_CALENDAR_URL_${string}`,
  string | undefined
>;

const campaigns: Record<string, CampaignSettings> = CAMPAIGNS;

export const settings = (name: string): CampaignSettings | undefined => campaigns[name];

export const byChannel = (channel: string | undefined): [string, CampaignSettings] | undefined =>
  Object.entries(campaigns).find(([, c]) => c.channel === channel);

export const webhook = (env: Env & Secrets, name: string) => env[`DISCORD_WEBHOOK_${name.toUpperCase()}`];

// iCloud only for the campaigns with a calendar of their own: the others get just the .ics feed.
export function icloud(env: Env & Secrets, name: string): ICloud | undefined {
  const calendar = env[`ICLOUD_CALENDAR_URL_${name.toUpperCase()}`];
  if (!calendar || !env.ICLOUD_USER || !env.ICLOUD_PASSWORD) return undefined;
  return { user: env.ICLOUD_USER, password: env.ICLOUD_PASSWORD, calendar };
}

export const campaign = (env: Env, name: string) => env.CAMPAIGN.get(env.CAMPAIGN.idFromName(name));
