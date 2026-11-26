---
name: new-session
description: Turn a game-session transcript into updates to that campaign's site — writes the new session journal entry and creates/updates every character, NPC, place, handout, the campaign overview and the map it touches. Use when the user pastes a session transcript (usually Italian, often messy speech-to-text), points at a transcript file such as sites/strahd/audio/session-NN.txt, or asks to "add/process/write up the latest session".
---

# New session

Turn a raw transcript into a complete, cross-linked update of a campaign site. All content you write is in **Italian**; follow the conventions in the root `CLAUDE.md` (wikilinks, spoilers, canonical names, frontmatter, don'ts).

**Which site.** Each campaign lives in `sites/<site>/`. Work out which one from the transcript's path (`sites/<site>/…`) or from the user's request; if it's unclear, ask (non-interactively: stop and say so). Every path below is relative to that site's folder. Read the site's `CLAUDE.md` before anything else: it has the campaign's labels and terminology (e.g. investigators and Keeper instead of characters and DM), its extra frontmatter fields, its reference sources and features such as a map.

The transcript is either pasted in the conversation or in a file passed as the argument. Automatic transcripts contain misheard words and mangled names — never silently guess: resolve what you can, and list the rest in the final report.

**Public site.** The site is public and indexed:

- Players are referred to only by their characters. Transcripts are full of real names ("Marco, tira l'iniziativa"): work out which character each player runs from context and the existing `personaggi/` files, and never write a real name anywhere.
- Write only what the group learned in play. Skip the game master's asides and explanations, out-of-character chatter, things the game master said by mistake and took back, and secrets one character learned privately unless they shared them with the group.

## 1. Gather context

Before writing anything:

- Grep `^numero:` in `src/content/sessions/` to get the next session number (highest + 1), then read the latest one or two sessions for continuity and tone.
- Read `src/content/riassunto/overview.md` for the current state of the campaign.
- Grep `^titolo:` in `src/content/personaggi/`, `png/`, `luoghi/` (and `handout/` if the site has it) for the list of existing entities. Every name you meet in the transcript must be matched against it — including near-misses from speech recognition (e.g. "Vargas Vallakovich" → `Barone Vargas`, "Ismarc" → `Ismark Kolyanovich`).
- For names you can't match, check canonical spelling in the reference sources named in the site's `CLAUDE.md` and `CLAUDE.local.md` (if there are none, flag the name in the report instead). Use them for spelling and to disambiguate only — never bring in anything the group hasn't learned in play.

## 2. Write the session

Create `src/content/sessions/sessione-NN.md` (NN zero-padded):

```yaml
---
titolo: <evocative title>
numero: <N>
stagione: <only if the site's sessions have one: the current season>
data: <YYYY-MM-DD — the real session date if known; interactively, ask if unknown; otherwise today and flag it>
estratto: <1-2 sentences, max 300 characters (schema-enforced)>
luoghiVisitati: [<titolo of each place the group was physically in — this is what marks a place as visited, on a map too if the site has one>]
tag: [<optional, short>]
bottino:  # D&D sites only (`features.schede: 'dnd5e'`); omit when nothing was kept
  monete: { mo: <N>, ma: <N> }  # any of mp, mo, me, ma, mr
  oggetti:
    - nome: <short name, as the group knows it: what it is, not its story (that's in the body); plain text, no wikilinks>
      chi: <the character who took it, by titolo; omit if shared or unclear>
---
```

`bottino` lists what the group found and kept this session, shown in a box at the end of the page: coins and items picked up, not money spent, documents read and left, or things left where they were. Each item with a `chi` also appears under "Bottino raccolto" on that character's page, so `chi` must resolve to the character's file like a wikilink would.

Body: a third-person narrative in Italian that summarises what happened, split into `##` sections by scene. Past tense or narrative present consistent with earlier sessions. Keep it readable prose — no raw transcript, no out-of-character table talk, no rules chatter unless it matters to the story. Link every entity on its first mention in each section.

## 3. Create new entities

For each character, NPC or place that appears for the first time, create a file named after the kebab-case, accent-free title (e.g. `padre-lucian-petrovich.md`). Fields besides `titolo` are optional; fill in what is known, use `sconosciuto` for things that matter but aren't known yet.

Use the fields listed in the root `CLAUDE.md` plus the site's own (its `CLAUDE.md`), for example a character's `classe` or `professione`. Leave `giocatore` out (no real names). Set `immagine: /images/personaggi/<id>.webp` only if that file exists. Whether a place was visited comes from the sessions' `luoghiVisitati`, not from the place. If the site has handouts and the group received a document, transcribe it in `handout/` and link to it.

Body: a short Italian paragraph with what the group knows and how they met it, linked back to the session and other entities.

## 4. Update existing entities

For each existing entity that appears again:

- Update frontmatter that changed: `stato` (e.g. `morto`), `luogo`, `ruolo`, `estratto` if it's now misleading.
- **Append** a paragraph describing the new development. Don't rewrite earlier history.
- Player characters: note significant personal moments (choices, injuries, items, relationships).

## 5. Overview and map

- Update `src/content/riassunto/overview.md` only if the campaign's overall state changed meaningfully (goal reached, new faction, new region, major death). Append or adjust the relevant section; don't rewrite it.
- If the site has a map, update it as its `CLAUDE.md` describes; don't invent coordinates for new pins — list them in the report so the user can place them.

## 6. Verify

Run `pnpm -C sites/<site> build` and check the output:

- It must succeed (schema errors, e.g. `estratto` over 300 characters, fail the build).
- Unresolved wikilinks fail the build, listed together: fix each by correcting the target or creating the missing entity.
- Fix every `[wikilinks] … names both …` warning: two entries share a name, so one of them is probably a duplicate.

## 7. Report

End with a short report:

- Session file created, entities created, entities updated.
- **Ambiguities**: every name or detail you had to interpret, with your choice (e.g. "«Strad» → Strahd von Zarovich", "unclear whether Izek died: left `stato: vivo`").
- Anything left for the user: map pins to place, a missing session date, the next session date if the site keeps it in `campaign.config.mjs`, and for new player characters the portraits to add in `public/images/personaggi/` (`<id>.webp` square + `<id>-full.webp` tall, converted from PNG as the root `CLAUDE.md` explains; the home page picks up the full one automatically, then set `immagine`).
- A suggested commit message, e.g. `feat(content): add sessione-11`.

Don't commit — the user reviews `git diff` first.
