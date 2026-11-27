---
name: new-campaign
description: Add a new campaign site to the cronache monorepo (sites/<name>/ on the shared @cronache/core engine), optionally wired to the Discord bot and its calendar. Use when the user starts a new campaign or one-shot series and wants its companion site, or asks to bring an existing site into the monorepo.
---

# Add a campaign

A campaign is one folder, `sites/<name>/`, holding only what's specific to it; the engine is `packages/core/`. The folder name is the campaign's key everywhere (bot secrets, feed URLs): short, lower-case, no accents.

## 1. The site

Create `sites/<name>/` with:

- `package.json`: depends on `@cronache/core` and `astro`; `build` = `astro build && pagefind --site dist`.
- `astro.config.mjs` (its `site` URL), `campaign.config.mjs` (name, labels, nav, fonts, footer, features: defaults and full shape in `packages/core/config.mjs`), `src/content.config.ts` (extra frontmatter fields), `src/styles/theme.css` (start from the tokens listed in the root `CLAUDE.md`), `src/pages/index.astro`, `public/` (with `robots.txt` and `images/og.png`), `netlify.toml`, `LICENSE-CONTENT`, and a `CLAUDE.md` with the campaign's specifics (system, sources for spelling, its own fields).
- The shared Ogre Ballerino pieces come from `sites/ogre-ballerino.mjs` (about popover, Umami, timezone, next session); add the site to its `CHRONICLES` list.

Copy an existing site's files as a starting point, never its content. Adapt the site to the engine rather than adding core options for one site; when the core really lacks something, make it general and configurable, never campaign-specific.

Then add the root scripts (`dev:<name>`, `build:<name>`) and check `pnpm build:all`.

## 2. Deploy

One Netlify project per site, with base directory `sites/<name>`; its `netlify.toml` skips builds when neither the site nor the engine changed. The domain and DNS are the user's to set up: list them in the report.

## 3. Discord and calendar (optional)

For announcements, `/next` and a calendar feed, follow "Adding a campaign" in `bots/discord/README.md` (the `discord-bot` skill explains the pieces): a `discord` section and `nextSession` in `campaign.config.mjs`, the webhook secret, the Netlify outgoing webhook, then a bot deploy.
