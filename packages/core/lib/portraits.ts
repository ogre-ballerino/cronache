import fs from 'node:fs';
import path from 'node:path';
import { publicDir } from 'virtual:cronache/paths';

export function fullPortrait(id: string): string | undefined {
  const src = `/images/personaggi/${id}-full.png`;
  return fs.existsSync(path.join(publicDir, src)) ? src : undefined;
}
