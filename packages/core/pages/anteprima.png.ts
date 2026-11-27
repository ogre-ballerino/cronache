import { createRequire } from 'node:module';
import path from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import style from 'virtual:cronache/card';
import config from 'virtual:cronache/config';
import { coreDir } from 'virtual:cronache/paths';
import { cardSvg } from '../lib/card.mjs';
import { collectionByKey } from '../lib/collections.mjs';
import { CARD_COLLECTIONS } from '../lib/og';
import { isAlive } from '../lib/status.mjs';

// sharp is the core's dependency, not the site's: the prerendered chunk can't import it by name.
const sharp: typeof import('sharp') = createRequire(path.join(coreDir, 'package.json'))('sharp');

type Entry = { titolo: string; estratto?: string; ruolo?: string; stato?: string; tipo?: string; regione?: string };

// What became of an NPC, unless alive, before their role (which may get cut short); a place's kind and region.
function kind(data: Entry) {
  if (data.tipo !== undefined) return [data.tipo, data.regione].filter(Boolean).join(' · ');
  const stato = data.stato && !isAlive(data.stato) && data.stato !== 'sconosciuto' && data.stato;
  return [stato, data.ruolo].filter(Boolean).join(' · ');
}

export const getStaticPaths = (async () => {
  const groups = await Promise.all(
    CARD_COLLECTIONS.map(async (key) =>
      (await getCollection(key)).map((entry) => ({
        params: { section: collectionByKey(key)!.section, id: entry.id },
        props: { data: entry.data as Entry },
      }))
    )
  );
  return groups.flat();
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props, site }) => {
  const data = props.data as Entry;
  const footer = [config.name, site?.hostname].filter(Boolean).join(' · ');
  const svg = await cardSvg({ kind: kind(data), title: data.titolo, excerpt: data.estratto, footer }, style);
  // Sixteen colours keep the text's antialiasing at a fraction of a full PNG's weight.
  const png = await sharp(Buffer.from(svg)).png({ palette: true, colours: 16, compressionLevel: 9 }).toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
