# Curse of Strahd — site notes

Companion site for a Curse of Strahd (D&D 5e) campaign, at strahd.ogreballerino.com. The general conventions are in the root `CLAUDE.md`; this file adds what's specific to this campaign.

- **Labels:** the default ones — Diario, Personaggi, Png, Luoghi; "Sessione" for a session.
- **Reference:** the official Curse of Strahd module, for canonical spelling and ambiguous details; the source to consult is set in `CLAUDE.local.md` (gitignored). Spoiler rules apply.
- **Sources:** session recordings and their transcripts live in `audio/` (gitignored).

## Frontmatter

- `personaggi/`: `classe` (e.g. "Chierico di Lathander"); `stato` is `vivo`|`morto`|`scomparso`|`ritirato`.
- `png/`: `stato` is `vivo`|`morto`|`scomparso`|`sconosciuto`.
- Sessions have no `stagione`.

## Site-specific notes

- Dark mode follows the system setting (the color tokens in `src/styles/theme.css`); the map keeps the light palette.
- The map (`/mappa`, `src/pages/mappa.astro`) uses a woodcut background image (`public/images/mappe/barovia.webp`: forests, water and relief only, with no labels, buildings or roads to avoid spoilers) that fades into the page through the `.map-fog` edge, in either colour scheme. On top of it, in 1920x1080 coordinates, sit only Barovia's "headline" places (not stops inside a settlement, e.g. the shops in Vallaki): pins placed by hand in the `nodes` array (`labelBelow: true` moves a label under its pin when it would overlap a neighbour's), roads in `travelledRoads` (red) or `knownRoads` (dashed). A pin shows as visited when any session lists the place in `luoghiVisitati`. When the party reaches a new place, add its pin and move the road from known to travelled; don't invent coordinates — leave new pins for the user to place.
- Renaming a place also means updating its id in the map's `nodes` array.
- Character sheets are on (`features.schede`): at every level-up, export each character from Foundry (2014 rules, Plutonium) and run `pnpm scheda`, with `--sessione` set to the session that ended with the level-up. The exports, as checked and corrected, live in `foundry/livello-NN/` (gitignored: Plutonium fills them with the books' text, which must not reach the public repo).
- The next session date is set from Discord with `/next` (the `discord-bot` skill); the home page reads it from the bot.
- **Discord letter:** Strahd von Zarovich writes it (`promemoria.lettera`, see the `new-session` skill), from his castle: aristocratic, sardonic, cruelly courteous, an invitation that sounds like a threat. Signed «S.».
