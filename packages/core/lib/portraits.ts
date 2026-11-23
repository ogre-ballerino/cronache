import fs from 'node:fs';
import path from 'node:path';
import { publicDir } from 'virtual:cronache/paths';
import { webpSize } from './image-size.mjs';

export function fullPortrait(id: string): string | undefined {
  const src = `/images/personaggi/${id}-full.webp`;
  return fs.existsSync(path.join(publicDir, src)) ? src : undefined;
}

export function imageSize(src: string): { width: number; height: number } | undefined {
  const file = path.join(publicDir, src);
  return src.endsWith('.webp') && fs.existsSync(file) ? webpSize(file) : undefined;
}
