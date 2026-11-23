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
- The map (`/mappa`, `src/pages/mappa.astro`) uses a painted background image (`public/images/mappe/barovia.webp`, with no labels or roads to avoid spoilers), desaturated by the `#sepia` SVG filter. On top of it, in 1920x1080 coordinates, sit only Barovia's "headline" places (not stops inside a settlement, e.g. the shops in Vallaki): pins placed by hand in the `nodes` array, roads in `travelledRoads` (red) or `knownRoads` (dashed). A pin shows as visited when any session lists the place in `luoghiVisitati`. When the party reaches a new place, add its pin and move the road from known to travelled; don't invent coordinates — leave new pins for the user to place.
- Renaming a place also means updating its id in the map's `nodes` array.
- The next session date is fetched in the browser from the CMS (`nextSession.endpoint` in `campaign.config.mjs`).
