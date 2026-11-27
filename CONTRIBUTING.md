# Contributing

Fixes and additions from the players are welcome: a missing NPC, a misspelled name, a detail the journal forgot.

## Content

Content lives in `sites/<campaign>/src/content/`, one Markdown file per entity, written in Italian. Before editing, read the conventions in [`CLAUDE.md`](./CLAUDE.md) and the site's own `CLAUDE.md`. The ones that matter most:

- **No spoilers.** Write only what the group learned in play, not what one character found out in secret or what the master let slip.
- **Link with wikilinks**: `[[Nome Entità]]`, or `[[Nome Entità|testo]]` to inflect a name. Never `[testo](/percorso)`.
- **One file per entity.** Search before creating a new one; to rename or merge entities, ask in the PR instead of renaming files, because the URLs are already indexed.
- **Append, don't rewrite**: add what happened next instead of rewriting earlier history.
- **One line per paragraph**, never hard-wrapped.

## Code

Code, comments, commit messages and docs are in English. Commits follow [Conventional Commits](https://www.conventionalcommits.org), subject line only: `feat(content): add Mago sconosciuto`, `fix(strahd): …`, `feat(core): …`. Run `pnpm build:<site>` before opening a PR, plus `pnpm test` and `pnpm build:all` when you touch `packages/core`. See the [README](./README.md) for the setup.

## Pull requests

Open the PR against `main` and fill in the template. Netlify builds deploy previews only for PRs with the `preview` label, and only for the sites they change. Netlify doesn't rebuild when a label is added: after labelling, push again or retry the deploy from Netlify.
