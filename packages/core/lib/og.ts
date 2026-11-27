import config from 'virtual:cronache/config';
import { collectionByKey } from './collections.mjs';
import { imageSize } from './portraits';

export interface OgImage {
  src: string;
  alt: string;
  type?: string;
  width?: number;
  height?: number;
  large: boolean;
}

const TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export const defaultOgImage: OgImage = {
  src: '/images/og.png',
  alt: config.ogImageAlt,
  type: 'image/png',
  width: 1200,
  height: 630,
  large: true,
};

function describe(src: string, alt: string, large: boolean): OgImage {
  const type = TYPES[src.split('.').pop()!.toLowerCase()];
  return { src, alt, type, large, ...imageSize(src) };
}

// Collections whose entries without an image get a typographic card (pages/anteprima.png.ts).
export const CARD_COLLECTIONS = ['png', 'luoghi'] as const;

export function entryCard(key: (typeof CARD_COLLECTIONS)[number], id: string, titolo: string): OgImage {
  const { section } = collectionByKey(key)!;
  return { ...defaultOgImage, src: `/anteprime/${section}/${id}.png`, alt: titolo };
}

// `anteprima` is picked for the preview, so it gets the large card; `immagine`
// is a square portrait or a document page, which reads better as a thumbnail.
export function ogImage(
  data: { titolo: string; anteprima?: string; immagine?: string },
  fallback: OgImage = defaultOgImage
): OgImage {
  if (data.anteprima) return describe(data.anteprima, data.titolo, true);
  if (data.immagine) return describe(data.immagine, data.titolo, false);
  return fallback;
}
