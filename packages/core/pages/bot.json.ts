import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import config from 'virtual:cronache/config';
import { entryUrl } from '../lib/collections.mjs';
import { longDate, toRoman } from '../lib/format';
import { ogImage } from '../lib/og';

// Read by the Discord bot (bots/discord): keep the shape in sync with its types.
export const GET: APIRoute = async ({ site }) => {
  const [latest] = (await getCollection('sessions')).sort((a, b) => b.data.numero - a.data.numero);
  const absolute = (path: string) => new URL(path, site).href;
  return Response.json({
    ...config.discord,
    ultima: latest && {
      url: absolute(entryUrl('sessions', latest.id)),
      titolo: latest.data.titolo,
      etichetta: `${config.labels.session} ${toRoman(latest.data.numero)}`,
      data: longDate(latest.data.data),
      estratto: latest.data.estratto ?? '',
      immagine: absolute(ogImage(latest.data).src),
    },
  });
};
