import fs from 'node:fs';
import path from 'node:path';
import { publicDir } from 'virtual:cronache/paths';
import { webpSize } from './image-size.mjs';

function existing(src: string): string | undefined {
  return fs.existsSync(path.join(publicDir, src)) ? src : undefined;
}

export function fullPortrait(id: string): string | undefined {
  return existing(`/images/personaggi/${id}-full.webp`);
}

// A session's woodcut without its text, rendered by `pnpm og` next to the link preview.
export function sessionArt(id: string): string | undefined {
  return existing(`/images/sessioni/${id}-arte.webp`);
}

export function imageSize(src: string): { width: number; height: number } | undefined {
  const file = path.join(publicDir, src);
  return src.endsWith('.webp') && fs.existsSync(file) ? webpSize(file) : undefined;
}
