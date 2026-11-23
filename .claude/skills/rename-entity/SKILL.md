---
name: rename-entity
description: Rename a character, NPC, place or handout on one of the campaign sites, or merge duplicate entity files into one canonical entry, rewriting every wikilink and reference and redirecting the old URL. Use when the user asks to rename, respell, fix the name of, merge or deduplicate an entity (e.g. "Ismarc and Ismark are the same person", "it's Rictavio, not Rictavo"), or when the new-session skill reports a likely duplicate.
---

# Rename or merge an entity

An entity's `titolo` and filename are load-bearing: wikilinks resolve against them, backlinks are computed from them, and the filename is the page URL, which search engines have already indexed. Change them only through this procedure. Content stays in Italian and follows the root `CLAUDE.md`.

**Which site.** Work out the campaign from the user's request (or the entity's location) and work inside `sites/<site>/`: every path below is relative to it. Read that site's `CLAUDE.md` first. If the site is unclear, ask.

## 1. Pin down the change

- **Rename:** one file, new `titolo` (and usually a new filename).
- **Merge:** two or more files for the same entity → pick the canonical one (the correct canonical spelling, otherwise the one with more history) and fold the others into it.

For spelling, check the reference sources named in the site's `CLAUDE.md` and `CLAUDE.local.md`, spoiler-free as always. If the user's intent is unclear (which name wins, whether two NPCs are really the same), ask before touching anything.

New filename = kebab-case, accent-free `titolo` (e.g. `Ismark Kolyanovich` → `ismark-kolyanovich.md`).

## 2. Find every reference

Wikilink resolution is case-, accent- and apostrophe-insensitive and matches either `titolo` or filename, and a link can wrap across lines (e.g. `[[Padre di Artemis (nome\nsconosciuto)|padre]]`). So search broadly, for each old name:

- Grep `src/content/` for the old `titolo`, the old filename id, and a distinctive single word of the name (to catch wrapped links and spelling variants).
- Also check the non-wikilink references:
  - `luoghiVisitati:` in session frontmatter (holds place titles),
  - `luogo:` in `png/` frontmatter (plain text place name),
  - `immagine:` paths and `public/images/personaggi/<id>*.webp` for characters (rename the image files along with the entry),
  - anything else the site's `CLAUDE.md` lists as referring to entity ids (e.g. a map's pins).

## 3. Apply

Rename:

- `git mv` the file to the new filename and update `titolo`.

Merge:

- Fold the duplicates' bodies into the canonical file in chronological order (use the session numbers they mention), removing repetition but not history. Frontmatter: keep the most recent state (`stato`, `luogo`…), the best `estratto`, the union of `tag`.
- `git rm` the duplicate files.

Then, in both cases, rewrite every reference found in step 2:

- `[[Old]]` → `[[New]]` if the new name reads correctly in the sentence, otherwise `[[New|old text]]`.
- `[[Old|alias]]` → `[[New|alias]]`.
- Update `luoghiVisitati`, `luogo`, `immagine` and any other id the site's `CLAUDE.md` lists.

## 4. Redirect the old URL

For every filename that changed or was removed, add a permanent redirect to the site's `netlify.toml` so indexed links keep working:

```toml
[[redirects]]
  from = "/png/ismarc"
  to = "/png/ismark-kolyanovich/"
  status = 301
```

The section prefix is the collection's route: `/personaggi`, `/png`, `/luoghi`, `/diario`, `/handout`. The `to` URL ends in `/` (every page URL does; without it the visitor gets a second redirect).

## 5. Verify

- Grep `src/content/` again for the old names: nothing should remain except deliberate aliases.
- Run `pnpm -C sites/<site> build`: it must succeed (an unresolved wikilink fails it) with no `[wikilinks] … names both …` warnings.

## 6. Report

List the files renamed, merged and removed, the references rewritten, and the redirects added, then suggest a commit message, e.g. `fix(content): merge Ismarc into Ismark Kolyanovich`. Don't commit.
