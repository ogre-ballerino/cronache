import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { webpSize } from '../lib/image-size.mjs';

function webp(chunk, write) {
  const b = Buffer.alloc(30);
  b.write('RIFF', 0, 'ascii');
  b.write('WEBP', 8, 'ascii');
  b.write(chunk, 12, 'ascii');
  write(b);
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cronache-webp-')), 'x.webp');
  fs.writeFileSync(file, b);
  return file;
}

describe('webpSize', () => {
  it('reads extended (VP8X) headers', () => {
    const file = webp('VP8X', (b) => {
      b.writeUIntLE(600 - 1, 24, 3);
      b.writeUIntLE(900 - 1, 27, 3);
    });
    assert.deepEqual(webpSize(file), { width: 600, height: 900 });
  });

  it('reads lossy (VP8) headers', () => {
    const file = webp('VP8 ', (b) => {
      b.writeUInt16LE(635, 26);
      b.writeUInt16LE(619, 28);
    });
    assert.deepEqual(webpSize(file), { width: 635, height: 619 });
  });

  it('reads lossless (VP8L) headers', () => {
    const file = webp('VP8L', (b) => b.writeUInt32LE((400 - 1) | ((300 - 1) << 14), 21));
    assert.deepEqual(webpSize(file), { width: 400, height: 300 });
  });

  it('returns undefined for anything else', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cronache-webp-')), 'x.png');
    fs.writeFileSync(file, Buffer.alloc(30));
    assert.equal(webpSize(file), undefined);
  });
});
