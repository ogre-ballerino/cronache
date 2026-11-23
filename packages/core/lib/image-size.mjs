import fs from 'node:fs';

// Dimensions from a WebP header, so an <img> can reserve its space before it loads.
export function webpSize(file) {
  const b = Buffer.alloc(30);
  const fd = fs.openSync(file, 'r');
  try {
    fs.readSync(fd, b, 0, b.length, 0);
  } finally {
    fs.closeSync(fd);
  }
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return undefined;
  switch (b.toString('ascii', 12, 16)) {
    case 'VP8X':
      return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    case 'VP8 ':
      return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    case 'VP8L': {
      const bits = b.readUInt32LE(21);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) };
    }
  }
  return undefined;
}
