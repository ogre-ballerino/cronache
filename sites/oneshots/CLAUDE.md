# La Bacheca dell'Ogre — site notes

Companion site for the standalone one-shots played at the Ogre Ballerino, at oneshots.ogreballerino.com. Each one-shot is a session of its own, shown as a notice pinned to a tavern quest board; characters can come back from one adventure to the next. The general conventions are in the root `CLAUDE.md`; this file adds what's specific to this site.

- **Labels:** Avventure (`/diario`), Personaggi, Png, Luoghi; "Avviso" for a session (an adventure). The old `/avventure/…` URLs redirect to `/diario/…` (`netlify.toml`).
- **No riassunto** (`features.riassunto: false`): the adventures are unrelated, so skip the new-session skill's overview step.
- **Game systems:** every adventure and every character has a `sistema` (default `dnd5e`, the only one for now). The list lives in `src/lib/systems.ts`; adding a system is one entry there, plus its reference source in `CLAUDE.local.md`. A new system may need its own character fields (e.g. `professione` instead of `classe`): add them to the schema rather than overloading existing ones.
- **Sources:** recordings and transcripts live in `audio/` (gitignored). For published adventures, the system's reference in `CLAUDE.local.md` helps with spelling and with identifying the source; other groups may play the same adventure and read this site, so never copy anything the characters didn't experience.
- **Visual theme:** a tavern wall of oak planks drawn in CSS, with paper pinned to it, in a hand-drawn style (flat colours, ink outlines), never realistic textures. Dark mode only darkens the wall; the paper keeps its light palette. Every inner page is one pinned sheet (`src/styles/theme.css`); the home page is the quest board, with a notice per adventure and the regulars' portraits (`src/styles/board.css`, `src/components/`).

## Frontmatter

- `sessions/` (adventures): the filename is the kebab-case title (e.g. `il-faro-spento.md`), not `sessione-NN`. Besides the core fields: `sistema`, `livello` (character level, if the system has levels), `fonte` (the published adventure, omitted for homebrew), `ambientazione`, `personaggi` (the `titolo` of each player character who took part), `esito` (`compiuta`|`fallita`|`in corso`, only when clear from play; `in corso` when it continues another evening). Leave `master` out unless the user gives a nickname to show. A one-shot that spills over into a second evening stays in the same file: append new `##` sections and update `esito`.
- `personaggi/`: `classe`, `razza`, `sistema`. A character has ONE file for their whole career: before creating one, match the name against the existing characters (including speech-to-text near-misses); a returning character is listed in the adventure's `personaggi` and gets a paragraph appended about this adventure, linking it.

## Site-specific notes

- An adventure's party comes from its `personaggi` (names resolved like wikilinks by `src/lib/party.ts`; an unknown name logs a `[party]` warning, fix it like an unresolved wikilink). It drives the avatars on its notice and the "Gli habitué" ranking on the home page. Characters also need a wikilink in the adventure's text to get it in their backlinks.
- Avatars use `immagine`; without it a character gets a wax seal with their initials.
- Character sheets are off: turn on `features.schede: 'dnd5e'` when the first Foundry export arrives.
