---
name: discord-bot
description: Work on the campaigns' Discord bot in bots/discord (cronache-bot, a Cloudflare Worker) — session announcements, the Ogre Tamburino app and its /next command (/prossima in Italian), the iCloud calendar and the public .ics feeds, the next session on the home pages. Use when the user asks to add a campaign to the bot, set or rotate its secrets, deploy it, debug a missing announcement or a /next error, change what the bot posts, or touch packages/core/pages/bot.json.ts.
---

# The Discord bot

`bots/discord/` (`cronache-bot`, `https://cronache-bot.sirlisko.workers.dev`): a Cloudflare Worker with one Durable Object per campaign. Its setup, step by step, is in `bots/discord/README.md`: read it before changing secrets, Netlify or the Discord application.

## How it fits together

- **Campaigns** are the sites with `discord` in `campaign.config.mjs` (`DiscordConfig` in `packages/core/config.mjs`). `scripts/campaigns.ts` collects them into `src/campaigns.ts` (gitignored) on `dev`, `check` and `deploy`: nothing about a campaign lives in `wrangler.jsonc`.
- **Announcements:** the build publishes `/bot.json` (`packages/core/pages/bot.json.ts`: announcement text, latest session, every session's date). Netlify's "deploy succeeded" outgoing webhook, signed with a JWS secret, calls `POST /netlify/<campaign>`; the Worker reads the live `/bot.json` and posts the latest session to the campaign's webhook once. The first call after setup only records it. Keep `bot.json`'s shape in sync with `src/bot.ts`.
- **`/next`** (`/prossima` in Discord clients set to Italian; the Ogre Tamburino app, `POST /discord`): sets the next session. The campaign's webhook posts it (the bat for Strahd, the cat for Ombre: players only ever see the campaign's voice; the app only replies privately to whoever used it). The campaign is found from the channel (`discord.channel`). Only members with Manage Events see the command; the server grants it to a role under Integrations.
- **Calendars:** `/calendar/<campaign>.ics` is the public feed (the `/next` dates plus every session in the journal, from `bot.json`). A campaign with `ICLOUD_CALENDAR_URL_<CAMPAIGN>` also writes to that iCloud calendar; a failure there only shows in the private reply, never blocks the post.
- **Home pages:** `NextSession` reads `/next/<campaign>.json`, with a `webcal://` link to the feed (`ogreBallerinoNextSession` in `sites/ogre-ballerino.mjs`).

## Secrets

`wrangler secret put` from `bots/discord`: `NETLIFY_JWS_SECRET`, `DISCORD_WEBHOOK_<CAMPAIGN>`, `ICLOUD_USER`, `ICLOUD_PASSWORD` (app-specific), `ICLOUD_CALENDAR_URL_<CAMPAIGN>`. The bot token lives only in `.dev.vars` (gitignored), for `pnpm commands`. Code, config keys and routes are in English; only what players read (messages, the command's Italian names) is Italian. Never print a secret's value: pipe it (`printf %s "$X" | npx wrangler secret put NAME`) and read files holding one by their keys only.

## Commands

Inside `bots/discord`: `pnpm test`, `pnpm check` (also generates `worker-configuration.d.ts`, gitignored), `pnpm run deploy` (plain `pnpm deploy` is pnpm's own command), `pnpm commands` after changing `COMMAND` in `src/discord.ts`, `npx wrangler tail` for live logs. Deploying changes the live bot: ask first.
