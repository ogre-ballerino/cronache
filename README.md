# Cronache

Companion sites for Italian-language tabletop RPG campaigns: session journal, characters, NPCs, places and handouts, cross-linked with Obsidian-style wikilinks. Built with [Astro](https://astro.build), content in Markdown. One shared engine, one folder per campaign:

| Site | Campaign | URL |
|---|---|---|
| [`sites/strahd`](./sites/strahd) | *Curse of Strahd* (D&D 5e) | [strahd.ogreballerino.com](https://strahd.ogreballerino.com) |
| [`sites/ombre`](./sites/ombre) | *L'Equilibrio delle Ombre* (Call of Cthulhu 7e) | [ombre.ogreballerino.com](https://ombre.ogreballerino.com) |

The engine is [`packages/core`](./packages/core) (`@cronache/core`), an Astro integration: content schema, wikilinks, backlinks, margin notes, layouts, the shared pages and the base stylesheet. Each site brings its content, a `campaign.config.mjs` (name, labels, fonts, features), a theme and its home page.

The sites are in Italian; code and docs are in English. Editorial conventions (frontmatter, wikilinks, spoilers) live in [`CLAUDE.md`](./CLAUDE.md), plus each site's own `CLAUDE.md`. The procedures for turning a session transcript into site updates and for renaming entities are Claude Code skills in [`.claude/skills/`](./.claude/skills). They're written to guide Claude Code, but they're also the source of truth for anyone writing content by hand.

## Development

Requires Node.js 22.12+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev:strahd       # http://localhost:4321
pnpm build:strahd     # static output in sites/strahd/dist/ (plus the Pagefind search index)
pnpm build:all        # every site: run it after touching packages/core
```

Inside a site folder, plain `pnpm dev`, `pnpm build` and `pnpm preview` work too.

Each site is a separate Netlify site with its folder as base directory; its `netlify.toml` skips the build when neither the site nor the engine changed.

## Adding a session

Run Claude Code from the repository root and paste the session transcript (or ask it to process `sites/<site>/audio/session-NN.txt`): the `new-session` skill writes the session entry, creates or updates characters, NPCs, places and handouts, adjusts the overview and map, builds the site to catch broken wikilinks, and reports any ambiguities. You can also invoke it explicitly with `/new-session`.

To rename an entity or merge duplicates (common with misheard names), ask Claude Code or run `/rename-entity`: it rewrites every wikilink and adds a 301 redirect to the site's `netlify.toml` for the old URL.

## Audio → session pipeline

Instead of pasting a transcript, you can start from the audio recording. One script transcribes it locally, then a second one runs Claude Code non-interactively with the `new-session` skill.

### Requirements

- macOS 14+ on Apple Silicon (required by `parakeet-coreml`, which runs transcription on the Neural Engine; it's an optional dependency and is skipped on other platforms)
- `ffmpeg` (`brew install ffmpeg`)
- [Claude Code](https://claude.com/product/claude-code), installed and authenticated (`claude auth login`), since the pipeline calls it as a CLI

### 1. Add the audio

Put the recording in the site's `audio/` folder. It's gitignored, so recordings and raw transcripts never end up in the repo:

```bash
mkdir -p sites/strahd/audio
cp ~/Recordings/session-11.mp3 sites/strahd/audio/
```

### 2. Transcribe

```bash
pnpm transcribe strahd                                # picks the only new file in sites/strahd/audio/
pnpm transcribe sites/strahd/audio/session-11.mp3     # or name the file
```

Converts the audio to 16kHz mono PCM with `ffmpeg` and transcribes it with **Parakeet TDT v3** (Neural Engine accelerated, ~40x realtime on Apple Silicon, so an hour of audio takes about 90 seconds). The first run downloads ~1.5GB of models, which are cached afterwards. Produces `sites/strahd/audio/session-11.txt`.

### 3. Generate the content

```bash
pnpm session sites/strahd/audio/session-11.txt
```

Runs `claude -p` non-interactively with the `new-session` skill on the transcript, for the site whose folder holds it. The default model is `sonnet`; override it with `CLAUDE_MODEL=opus pnpm session ...`.

**Always review `git diff` before committing.** Automatic transcription can misrecognise words or mangle names, and in non-interactive mode Claude can't ask clarifying questions. When something is ambiguous, it flags it in its final message instead of silently guessing.

### Cost

If Claude Code is signed in with a subscription (Pro/Max), `pnpm session` has no metered cost and counts against your plan's usage limits like a normal interactive session. With an API key it's billed per token (for a 2-3 hour session, roughly a few cents with Sonnet).

## License

- **Code** is licensed under [MIT](./LICENSE).
- **Campaign content** (each site's `src/content/` and `public/images/`) is licensed under CC BY-NC 4.0: see the `LICENSE-CONTENT` file in each site, and its README for the fan content notices.
