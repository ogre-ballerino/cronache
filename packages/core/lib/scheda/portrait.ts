import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { coreDir, publicDir } from 'virtual:cronache/paths';
import { fullPortrait } from '../portraits';

/** The character's portrait (the tall one when there is one) as a JPEG for pdf-lib, which can't read WebP. */
// sharp is native, so the build leaves it out of the page bundle; resolve it
// from the engine, which depends on it, not from the site, which doesn't.
const sharp = createRequire(path.join(coreDir, 'package.json'))('sharp') as typeof import('sharp');

export async function portraitJpeg(id: string, immagine?: string): Promise<Uint8Array | undefined> {
  const src = fullPortrait(id) ?? immagine;
  const file = src && path.join(publicDir, src);
  if (!file || !fs.existsSync(file)) return undefined;
  // JPEG has no alpha: transparent backgrounds would turn black, not paper white.
  return sharp(file).resize({ width: 600, withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 85 }).toBuffer();
}
