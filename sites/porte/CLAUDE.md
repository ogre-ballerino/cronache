# Porte sull'Oscurità — site notes

Companion site for the group's run through *Doors to Darkness*, Chaosium's book of five standalone Call of Cthulhu 7e scenarios, played with the same investigators (the book's pre-generated characters), at porte.ogreballerino.com. The first scenario, Genius Loci, started on 2026-11-24. The general conventions are in the root `CLAUDE.md`; this file adds what's specific to this campaign.

- **Labels:** Capitoli (`/diario`), Investigatori (`/personaggi`), Comprimari (`/png`), Luoghi, Handout; "Capitolo" for a session, "Avventura" for a season. The game master is the Keeper.
- **One season per scenario:** `stagione` is the scenario's number in the order the group plays them, and `seasons` in `campaign.config.mjs` maps it to the scenario's title (`{ 1: 'Genius Loci' }`), shown as the season heading. Add the next entry when the group starts a new scenario. `numero` keeps counting across scenarios.
- **Sources:** session transcripts and notes go in `sources/` (gitignored). The scenario book is the reference for spelling (see `CLAUDE.local.md`): it is written for the Keeper, so everything in it beyond what the group found out in play is a spoiler. Only the pre-generated characters' pages are player material.
- **Visual theme:** a door ajar on the darkness, with a sickly green light and tentacles reaching out (`src/components/Door.astro`); the home page is an investigation table (a newspaper clipping for the latest chapter, a typed case file for the index, faded photographs for the investigators); every inner page is a typed report on paper with a column of alien glyphs in the margin (`public/images/glifi.svg`). The Elder Sign on the door is Lovecraft's branch, never Chaosium's star (their trademark).
- **Blockquotes** render as typed notes clipped to the report: use them sparingly.

## Frontmatter

- `sessions/`: `stagione` is required (the scenario).
- `personaggi/` (investigators): `professione`, `sottotitolo` (optional, shown after the profession, e.g. David Wilcox's stage name); use the feminine `stato` forms for women (Jessica Brooks).
- `png/` (comprimari): feminine `stato` forms for women, as above.
- `handout/` is enabled: sessions and entities link to a handout instead of repeating it.

## Site-specific notes

- The investigators' portraits are the photographs of the book's pre-generated characters (Italian edition, `PERSONAGGI.pdf`), cropped inside their deckled frames: they are excluded from the content license in `LICENSE-CONTENT`. Their pages paraphrase the book's descriptions, never copy them. An investigator without a `-full.webp` shows as a faded blank photograph on the home page.
- Investigator sheets are on (`features.schede: 'coc7e'`): use the `update-sheets` skill.
- No next session date yet: set `nextSession.at` in `campaign.config.mjs` when the group fixes one.
