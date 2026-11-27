# Cronache — project conventions

Monorepo of companion sites for tabletop RPG campaigns, built with Astro. One shared engine, one folder per campaign:

- `packages/core/` (`@cronache/core`): the engine, an Astro integration. Content schema, wikilinks, backlinks, margin notes, layouts, components, the shared pages (diario, personaggi, png, luoghi, handout, riassunto, cerca) and `styles/base.css`.
- `sites/<campaign>/`: one deployable site each. Only what's specific to that campaign: `src/content/`, `public/`, `campaign.config.mjs` (name, labels, nav, fonts, footer, features), `src/content.config.ts` (extra frontmatter fields), `src/styles/theme.css`, the home page and any page of its own (e.g. strahd's map), `netlify.toml`, and a `CLAUDE.md` with the campaign's specifics.

- `bots/discord/` (`cronache-bot`): the campaigns' Discord bot, a Cloudflare Worker (see Technical notes).

Each site's `CLAUDE.md` adds to this file: read it before touching that site's content.

**Language:** all site content (everything under `src/content/` and any user-visible text in pages, components and `campaign.config.mjs`) is written in **Italian**. Code, comments, commit messages and docs are in English. Collection names, frontmatter keys and URL routes are Italian and must stay that way; each site changes only the visible labels (e.g. "Capitoli" for `/diario`).

## Content conventions

These apply to every content edit, in every site, by hand or through a skill.

- **Session updates:** when the user pastes a session transcript or points at one (e.g. `sites/strahd/audio/session-NN.txt`), use the `new-session` skill (`.claude/skills/new-session/SKILL.md`). It covers the whole procedure: session file, new and updated entities, overview, map, verification.
- **Character sheets:** when the user hands over Foundry exports or Call of Cthulhu sheets (filled PDFs or photos), or says the party levelled up or finished a chapter's development phase, use the `update-sheets` skill (`.claude/skills/update-sheets/SKILL.md`): it checks the sheets against the rules before saving them.
- **Renames and merges:** to rename an entity or merge duplicates, use the `rename-entity` skill (`.claude/skills/rename-entity/SKILL.md`). Never change a `titolo` or a filename by hand: wikilinks, backlinks and the page URL (already indexed by search engines) depend on them.
- **No real names:** the sites are public and indexed. Players appear only as their characters — never write a player's real name anywhere in `src/content/`, even though transcripts are full of them. Leave `giocatore` empty unless the user explicitly gives a name or nickname to show there.
- **Wikilinks:** ALWAYS link entities with Obsidian-style wikilinks: `[[Nome Entità]]` for plain text, `[[Nome Entità|testo visualizzato]]` for an alias (e.g. to inflect a name). Use the entity's exact `titolo` (or its filename) as the target — resolution is case/accent-insensitive but works best with a near-exact match.
- **One canonical file per entity:** search the existing files before creating a new one; names with slight spelling variants must be unified into ONE file.
- **No spoilers:** only write what the group learned in play. Leave out game master asides, out-of-character explanations, slips the game master corrected, and anything only one character learned in secret unless it was shared with the group. Reference material for spelling and ambiguous details is named in the site's `CLAUDE.md` or `CLAUDE.local.md` (gitignored): never copy from it anything the characters haven't discovered yet — the players themselves read these sites.
- **Append, don't rewrite:** when an existing entity changes, update its frontmatter (`stato`, `luogo`, …) and add a paragraph about the new development; don't rewrite earlier history.
- **Markdown:** one line per paragraph, never hard-wrapped.

### Frontmatter (all sites)

- `sessions/sessione-NN.md`: `titolo`, `numero`, `stagione` (optional; when present, sessions are grouped by season), `data` (real session date), `estratto` (≤300 chars), `luoghiVisitati`, `tag`, `bottino` (optional, D&D sites: `monete` by denomination `mp`/`mo`/`me`/`ma`/`mr`, `oggetti` as `nome` plus `chi`, the character who took it; shown as a box at the end of the page and, per item, on the `chi` character's page). Body: third-person Italian narrative in `##` sections by scene.
- `personaggi/`: `titolo`, `giocatore`, `stato`, `fazione`, `estratto`, `tag`, `immagine` only if the file exists, plus the site's own fields (see its `CLAUDE.md`).
- `png/`: `titolo`, `ruolo`, `stato`, `fazione`, `luogo`, `estratto`, `tag`.
- `luoghi/`: `titolo`, `tipo`, `regione`, `estratto`, `tag`.
- `handout/` (sites with `features.handout`): `titolo`, `capitolo` (number of the session where the group got it), `fonte`, `estratto`, `tag`, `immagine` only if the file exists. Body: the document as the group read it, without adding text.
- `anteprima` (any collection, optional): the link-preview image, a path under `public/` (e.g. a handout photo for the session that revealed it); the build fails if the file is missing. It's shown as a large card. Without it, a page previews its `immagine` as a thumbnail, or the site's `images/og.png`.
- `stato` values (`packages/core/lib/status.mjs`): characters `vivo`|`morto`|`folle`|`scomparso`|`ritirato`, NPCs `vivo`|`morto`|`folle`|`scomparso`|`sconosciuto`, each with a feminine form (`viva`, `morta`, `scomparsa`, `ritirata`) for women.
- Filenames are the kebab-case, accent-free `titolo`. Files starting with `_` are drafts: skipped by the collections and by the wikilink slug map.

## Commits

Conventional commits, subject line only. Content updates use the `content` scope, e.g. `feat(content): add sessione-11`, `fix(content): merge Ismarc into Ismark Kolyanovich`; changes to one site's code or theme use its name as scope (`fix(strahd): …`); engine changes need no scope, or `core`.

## Don'ts

- Don't invent a second linking system: use only `[[...]]`, never manual markdown links `[testo](/percorso)` for internal references between entities.
- Don't add a `slug` field to frontmatter (Astro derives the id from the filename; `slug` is reserved for a possible override).
- Don't install extra UI frameworks (no Tailwind/React/Vue) — the sites use plain CSS and pure Astro.
- Don't put anything campaign-specific in `packages/core/`: names, texts and paths go through `campaign.config.mjs`. The core must never import from `sites/`.

## Commands

From the root: `pnpm dev:<site>`, `pnpm build:<site>`, `pnpm build:all`, `pnpm scheda …` (character sheets, see below). Inside a site folder, plain `pnpm dev` / `pnpm build` / `pnpm preview`. Before committing a change to `packages/core/`, run `pnpm test` (engine unit tests, `node:test`, in `packages/core/test/`) and `pnpm build:all`: it serves every site.

## Technical notes

- `campaign.config.mjs` is passed to the `cronache()` integration in the site's `astro.config.mjs`; components read it from the `virtual:cronache/config` module. Defaults and the full shape are in `packages/core/config.mjs`. The site's absolute `contentDir` and `publicDir` come from `virtual:cronache/paths`, derived from Astro's `root`: never use `process.cwd()`.
- Every collection is registered once in `packages/core/lib/collections.mjs` (folder, route, config section, feature flag): routes, nav, slug map and backlinks derive from it. Build internal URLs with its `entryUrl(collection, id)` / `sectionUrl(section)`, never by hand. URLs always end in `/` (`trailingSlash: 'always'`, set by the integration): the built pages are directories, so a link without the slash costs a 301 on Netlify, and `astro dev` answers it with a 404. Hand-written links (footers, a site's own pages, `netlify.toml` redirect targets) need the slash too.
- The core injects its pages with `injectRoute`; a site's own `src/pages/` holds only the home page and pages no other site has.
- Wikilinks are resolved at build time by `packages/core/lib/wikilinks.mjs` (slug map, read from the site's `src/content/`, top-level files only) and `lib/remark-wikilinks.mjs` (remark plugin). In `astro dev` a wikilink to a missing entity renders as text styled as a "broken link" and logs a `[wikilinks] Unresolved link` warning; `astro build` (so Netlify too) fails and lists every unresolved link. Two entries sharing a normalized name log a `[wikilinks] … names both …` warning: unify or rename them.
- Backlinks ("Menzionato in") are computed by `lib/backlinks.ts` by scanning the markdown body of every entry, plus each session's `luoghiVisitati`.
- Session pages get margin notes on wide screens: `remark-wikilinks.mjs` lists, after each `##` heading, the NPCs and places mentioned there for the first time, with their `ruolo` (or `tipo`) and a † when `stato` is `morto`/`morta`. Keep `ruolo` short: it's what the margin shows.
- Astro caches rendered markdown in `node_modules/.astro/data-store.json` (inside each site) and doesn't notice changes to the remark plugins: delete that file after editing them, or old renders stick around.
- In `astro dev`, a new file added to `src/content/` may not be picked up right away by already-cached wikilinks: restart the dev server after adding new entities.
- Styles: `packages/core/styles/base.css` holds the structure, driven by tokens (`--color-bg`, `--color-ink`, `--color-ink-muted`, `--color-rubric`, `--color-rule`, `--color-hairline`, `--font-display`, `--font-body`, `--font-sc`, `--font-initial`). Each site's `theme.css` defines the tokens and its signature components; fonts are listed in `campaign.config.mjs` (`css`), before the theme. A rule used identically by every site belongs in `base.css`.
- The sites are indexable by search engines: `public/robots.txt` allows all crawlers and points to the sitemap generated by `@astrojs/sitemap`. Entry pages use their `estratto` as the meta description, so keep it a self-contained sentence.
- Session woodcuts (sites with an `og/` folder): `sites/<site>/og/sessione-NN.html` is the source, drawn in SVG with the site's `og.css` and `woodcut.js`; `pnpm og <file>` renders it with headless Chrome (needs Chrome, ImageMagick and cwebp) into `public/images/sessioni/sessione-NN.png` (the link preview, set as `anteprima`) and `sessione-NN-arte.webp` (the frontispiece, shown on the session page whenever the file exists). The images are committed: Netlify never renders them.
- Character portraits live in the site's `public/images/personaggi/` as WebP: `<id>.webp` (square, referenced by `immagine`) and `<id>-full.webp` (tall, shown on the home page and the character page — any character with this file is picked up automatically). Convert a new PNG with `cwebp -q 88 -m 6 -alpha_q 100 in.png -o out.webp` (a 600×900 portrait goes from ~950 KB to ~130 KB).
- A site's `src/content/` can be opened directly as an Obsidian vault to browse the links graphically.
- Character sheets (`features.schede`: `'dnd5e'` or `'coc7e'`, see `lib/scheda/systems.ts`): `pnpm scheda <input> <site> <character id> [--sessione N]` writes a compact JSON snapshot in `sites/<site>/src/schede/<id>/`: from a Foundry VTT dnd5e export, one `livello-NN.json` per level (`lib/scheda/dnd5e/foundry.mjs`); from a filled Chaosium "1920s Era Investigator" PDF, one `capitolo-NN.json` per chapter (`lib/scheda/coc7e/read.mjs`). Sheets on paper are transcribed by hand into the same JSON. The character page links to `/personaggi/<id>/scheda/` (the latest snapshot, then a history of what changed between snapshots) and to a PDF per snapshot, filled at build time from `packages/core/assets/scheda-<system>.pdf`, with the character's portrait (`-full.webp`, otherwise `immagine`) converted by sharp (`lib/scheda/portrait.ts`). The JSON is the source of truth: fix a wrong value there by hand, the system's `schema.ts` validates it. Game terms on the sheet stay in English, as on the printed sheets; only the site's own text is Italian, in `labels.sheetText` (defaults per system in `lib/scheda/text.mjs`). D&D: spells carry only technical details from Foundry's structured data; feature descriptions only for SRD 5.1 features (`lib/scheda/dnd5e/srd.mjs`), credited on the page under CC-BY-4.0. CoC: only the front page's numbers, never the backstory side (phobias, tomes, entities, personal story). Never paste rules text from the books.
- Search (`/cerca`) uses Pagefind: the index is generated by the site's `pnpm build` (the `pagefind --site dist` step) and so does NOT exist in `astro dev` — to try it, use `pnpm build && pnpm preview`. Only pages using `EntryLayout` (`data-pagefind-body`) are indexed, with a `sezione` filter; metadata, badges, backlinks and pagination are excluded with `data-pagefind-ignore`. Supports `/cerca/?q=term`.
- Discord bot (`bots/discord/`, a Cloudflare Worker with one Durable Object per campaign): a site with `discord` in `campaign.config.mjs` publishes `/bot.json` (its announcement text and its latest session, `packages/core/pages/bot.json.ts`). Netlify's "deploy succeeded" outgoing webhook, signed with a JWS secret, calls `POST /netlify/<campaign>`; the Worker reads the live `/bot.json` and posts the session to the campaign's Discord webhook once (the first call after setup only records it). `/next` (the Ogre Tamburino app, `POST /discord`) sets the next session: the webhook posts it, the iCloud calendar and `/calendar/<campaign>.ics` get the event, and the home page's `NextSession` reads it from `/next/<campaign>.json`, with a `webcal://` link to the feed (`ogreBallerinoNextSession` in `sites/ogre-ballerino.mjs`). Its campaigns are the sites with `discord` in `campaign.config.mjs` (`DiscordConfig` in `packages/core/config.mjs`), collected at deploy by `scripts/campaigns.ts`; secrets via `wrangler secret put`: `NETLIFY_JWS_SECRET`, `DISCORD_WEBHOOK_<CAMPAIGN>`, `ICLOUD_USER`, `ICLOUD_PASSWORD`, and `ICLOUD_CALENDAR_URL_<CAMPAIGN>` for each campaign with an iCloud calendar. Inside the folder: `pnpm test`, `pnpm check` (generates `worker-configuration.d.ts`, gitignored), `pnpm run deploy` (plain `pnpm deploy` is pnpm's own command). Keep `bot.json`'s shape in sync with `src/bot.ts`. Setup steps (secrets, Netlify, the Ogre Tamburino Discord app) are in `bots/discord/README.md`.
- Deploys: one Netlify site per folder (base directory `sites/<campaign>`); its `netlify.toml` skips builds when neither the site nor the engine changed.

## Adding a campaign

Create `sites/<name>/` with `package.json` (depends on `@cronache/core` and `astro`; `build` = `astro build && pagefind --site dist`), `astro.config.mjs`, `campaign.config.mjs`, `src/content.config.ts`, `src/styles/theme.css` (start from the tokens above), `src/pages/index.astro`, `public/`, `netlify.toml`, `LICENSE-CONTENT` and a `CLAUDE.md`. Copy an existing site's files as a starting point, never its content. For the Discord bot (announcements, `/next`, calendar), follow "Adding a campaign" in `bots/discord/README.md`.
