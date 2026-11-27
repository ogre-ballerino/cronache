---
name: add-portrait
description: Add or replace a character's portrait on a campaign site — convert the image to the two WebP files the site uses and set the character's `immagine`. Use when the user hands over a portrait (PNG, JPG) for a player character or NPC, asks to add, change or fix a character's picture, or when the new-session skill reports a new player character without one.
---

# Add a character portrait

Portraits live in the site's `public/images/personaggi/`, named after the character's id (its filename without `.md`):

- `<id>.webp`: square, about 400×400, referenced by the character's `immagine` frontmatter (`/images/personaggi/<id>.webp`). Set `immagine` only once the file exists: the build fails otherwise.
- `<id>-full.webp`: tall, about 600×900, shown on the home page and the character page. Any character with this file is picked up automatically, and the sheet PDF prefers it (`lib/scheda/portrait.ts`).

Match the site's existing portraits (look at two or three first): framing, background, and any frame or tint the site uses.

1. Crop the source to each shape (ImageMagick: `magick in.png -gravity north -crop …`; keep the face in the upper third of the tall one).
2. Convert each crop: `cwebp -q 88 -m 6 -alpha_q 100 in.png -o out.webp` (a 600×900 portrait goes from ~950 KB to ~130 KB).
3. Set `immagine` on the character, then `pnpm build:<site>` and look at the home page and the character page.

The user's images are the source: don't redraw or "improve" a portrait unless asked. When the user asks for a new one to be generated, ask which tool to use and show it before saving.
