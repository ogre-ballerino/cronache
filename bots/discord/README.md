# cronache-bot

The campaigns' Discord bot: a Cloudflare Worker (`https://cronache-bot.sirlisko.workers.dev`) with one Durable Object per campaign. A campaign is any site whose `campaign.config.mjs` has a `discord` section: `pnpm campaigns` (run by `dev`, `check` and `deploy`) collects them into `src/campaigns.ts`, gitignored.

## Adding a campaign

1. In the site's `campaign.config.mjs`, a `discord` section (see `DiscordConfig` in `packages/core/config.mjs`): `announcement`, `readMore`, `color` for the announcements; `channel` (the channel's ID: in Discord, with Settings → Advanced → Developer Mode on, right-click the channel → Copy ID), `event`, `signature` and `timezone` (`OGRE_BALLERINO_TIMEZONE`) for `/next`. Also `nextSession: ogreBallerinoNextSession('<campaign>')`, so the home page shows the date.
2. The channel's webhook as a secret: `npx wrangler secret put DISCORD_WEBHOOK_<CAMPAIGN>` (the site's folder name, upper-case).
3. The Netlify outgoing webhook, as in step 3 below.
4. Optionally, its iCloud calendar: `npx wrangler secret put ICLOUD_CALENDAR_URL_<CAMPAIGN>` (see Ogre Tamburino, step 7).
5. `pnpm run deploy`.

Two voices on Discord:

- **The campaign's webhook** (Strahd's bat, Ombre's cat) posts everything the players see: new-session announcements and the next session's date.
- **Ogre Tamburino**, a Discord application shared by every campaign, only answers the `/next` slash command.

Commands, from this folder: `pnpm test`, `pnpm check` (generates `worker-configuration.d.ts`, gitignored), `pnpm run deploy` (plain `pnpm deploy` is pnpm's own command), `npx wrangler tail` for live logs.

## Session announcements

On each production deploy, Netlify calls `POST /netlify/<campaign>`. The Worker reads the site's live `/bot.json` and posts its latest session to the campaign's webhook once. The first call after setup only records the current session.

1. One secret shared by every site, generated without echoing it:
   ```sh
   SECRET=$(openssl rand -hex 32)
   printf %s "$SECRET" | npx wrangler secret put NETLIFY_JWS_SECRET
   printf %s "$SECRET" | pbcopy
   unset SECRET
   ```
   Keep it in the password manager: Wrangler can't show it again.
2. The campaign's webhook (Discord: channel settings → Integrations → Webhooks → Copy URL):
   ```sh
   npx wrangler secret put DISCORD_WEBHOOK_<CAMPAIGN>
   ```
3. Netlify, the site's project: Project configuration → Notifications → Deploy notifications → Add notification → Outgoing webhook. Event **Deploy succeeded**, URL `https://cronache-bot.sirlisko.workers.dev/netlify/<campaign>`, JWS secret token from step 1.
4. Check: trigger a production deploy with `npx wrangler tail` open; the Worker answers `recorded …` and posts nothing.

## Ogre Tamburino (`/next`)

`/next date time` (`/prossima data ora` in Discord clients set to Italian) in a campaign's channel sets the next session. Both fields suggest values as you type (the next days; the last time used), and also take `28/11` and `16:30` typed by hand, read in the campaign's timezone (`timezone`). Then:

- whoever used it gets a private confirmation with an **Annulla** button;
- the campaign's webhook posts the date in the channel, with a link to the campaign's calendar feed, `/calendar/<campaign>.ics`;
- the site's home page shows it, read from `/next/<campaign>.json` (`nextSession: ogreBallerinoNextSession('<campaign>')` in the site's config);
- if the campaign has an iCloud calendar (`ICLOUD_CALENDAR_URL_<CAMPAIGN>`), the event goes there too (3 hours, titled with the campaign's `event`); campaigns without one get only the feed.

A new date replaces the session still to come; past sessions stay, as history. **Annulla** removes the event and the webhook says the session is off.

Only members with the **Manage Events** permission see the command. Give it to the role that sets the dates under Server Settings → Integrations → Ogre Tamburino → `/next`, or by giving that role the permission.

Setup, once:

1. [Discord Developer Portal](https://discord.com/developers/applications) → New Application → **Ogre Tamburino**.
2. General Information: upload `assets/tamburino.png` as the app icon. Copy the **Application ID** and **Public Key** into `wrangler.jsonc` (`DISCORD_APP_ID`, `DISCORD_PUBLIC_KEY`): both are public.
3. Installation: Installation Contexts → Guild Install only (untick User Install). Install Link → **None**.
4. Bot: untick **Public Bot**, so nobody else can add it. Reset Token, and put it in `.dev.vars` (gitignored) as `DISCORD_BOT_TOKEN=…`: only `pnpm commands` uses it, never the Worker.
5. OAuth2 → URL Generator: scope `applications.commands` only (the app never posts on its own). Open the generated URL and add the app to the server.
6. Each campaign's channel ID goes in its site's `discord.channel` (see Adding a campaign).
7. iCloud (optional), with an [app-specific password](https://account.apple.com) (Sign-In and Security → App-Specific Passwords), then one calendar per campaign that wants it (several campaigns can share one):
   ```sh
   npx wrangler secret put ICLOUD_USER                      # the Apple ID
   npx wrangler secret put ICLOUD_PASSWORD                  # the app-specific password
   npx wrangler secret put ICLOUD_CALENDAR_URL_<CAMPAIGN>   # https://pNN-caldav.icloud.com/<id>/calendars/<calendar>/
   ```
   A calendar's CalDAV URL: create the calendar in the Calendar app, then find its id with a `PROPFIND` on `https://pNN-caldav.icloud.com/<id>/calendars/` (or ask Claude).
8. `pnpm run deploy`, then General Information → Interactions Endpoint URL → `https://cronache-bot.sirlisko.workers.dev/discord`. Discord checks the endpoint when you save, so the Worker must already be deployed.
9. `pnpm commands` registers the command (again after any change to `COMMAND` in `src/discord.ts`).
