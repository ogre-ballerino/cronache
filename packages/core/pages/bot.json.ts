import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import config from 'virtual:cronache/config';
import { entryUrl } from '../lib/collections.mjs';
import { longDate, toRoman } from '../lib/format';
import { ogImage } from '../lib/og';

// Read by the Discord bot (bots/discord): keep the shape in sync with its types.
export const GET: APIRoute = async ({ site }) => {
  const sessions = (await getCollection('sessions')).sort((a, b) => b.data.numero - a.data.numero);
  const [latest] = sessions;
  const absolute = (path: string) => new URL(path, site).href;
  const { announcement, readMore, color, letter } = config.discord;
  return Response.json({
    announcement,
    readMore,
    color,
    letter,
    latest: latest && {
      url: absolute(entryUrl('sessions', latest.id)),
      title: latest.data.titolo,
      label: `${config.labels.session} ${toRoman(latest.data.numero)}`,
      date: longDate(latest.data.data),
      excerpt: latest.data.estratto ?? '',
      image: absolute(ogImage(latest.data).src),
      letter: latest.data.promemoria?.lettera,
      recap: latest.data.promemoria?.recap,
    },
    // Every session's real date, for the calendar feed's history.
    sessions: sessions.map((s) => ({
      date: s.data.data.toISOString().slice(0, 10),
      title: s.data.titolo,
      url: absolute(entryUrl('sessions', s.id)),
    })),
  });
};
