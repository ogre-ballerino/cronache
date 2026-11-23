import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** @param {Record<string, string>} files paths relative to src/content → contents */
export function contentFixture(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cronache-test-'));
  for (const [file, body] of Object.entries(files)) {
    fs.mkdirSync(path.join(dir, path.dirname(file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), body);
  }
  return dir;
}

export const entry = (fields, body = '') =>
  `---\n${Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n${body}\n`;
