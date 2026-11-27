# L'Equilibrio delle Ombre — site notes

Companion site for *L'Equilibrio delle Ombre*, an ongoing Call of Cthulhu 7e campaign (season 1, from the United States to Berlin, is finished; season 2 started on 2026-11-22), at ombre.ogreballerino.com. The visual theme is an occult "Miskatonic tome". The general conventions are in the root `CLAUDE.md`; this file adds what's specific to this campaign.

- **Labels:** Capitoli (`/diario`), Investigatori (`/personaggi`), Comprimari (`/png`), Luoghi, Handout; "Capitolo" for a session. The game master is the Keeper. The site title is the campaign name, with a "Call of Cthulhu" kicker on the home masthead.
- **Sources:** session transcripts and photos of the handwritten notes live in `sources/` (gitignored). The handwritten notes win over the transcript for name spelling and for what the investigators actually learned. There's no published module to check.
- **Marginalia:** a markdown blockquote (`> …`) renders as a handwritten note in the margin of the tome. Use it sparingly, e.g. for a memorable line from the handwritten notes.

## Frontmatter

- `sessions/`: `stagione` is required. `numero` keeps counting across seasons (season 2 starts at 8).
- `personaggi/` (investigators): `professione`, `sottotitolo` (optional, shown under the name, e.g. "nel corpo di Alistair"); use the feminine `stato` forms for women.
- `png/` (comprimari): feminine `stato` forms for women, as above.
- `handout/` is enabled: sessions and entities link to a handout instead of repeating it.

## Site-specific notes

- Portraits of investigators who are dead, missing or retired are dimmed, and the home page shows them in a second row.
- When no investigator has a `-full.webp` portrait, the home page shows a "Dramatis personae" list instead.
- There's no map yet. A 1920s world map (US and Berlin) may come later; `luoghiVisitati` is kept on sessions for it.
- Investigator sheets are on (`features.schede: 'coc7e'`): a snapshot after a chapter, `pnpm scheda <sheet.pdf> ombre <id> --sessione N` for a filled Chaosium PDF, or transcribed by hand from a photo. The players' sheets and photos go in `sources/schede/capitolo-NN/` (gitignored: they hold the backstory, which stays off the site).
- The next session date is set from Discord with `/next` (the `discord-bot` skill); the home page reads it from the bot.
- **Discord letter:** the black cat writes it (`promemoria.lettera`, see the `new-session` skill), the voice of the campaign's Discord posts: it has slipped in everywhere and seen everything, and speaks of it cryptically, in short lines, never explaining. Unsigned: the post's footer reads «Il gatto nero».
