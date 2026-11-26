import { getCollection, type CollectionKey } from 'astro:content';
import config from 'virtual:cronache/config';
import { characterMeta } from './characters';
import { enabledCollections, entryUrl } from './collections.mjs';
import { toRoman } from './format';
import { sheetsByCharacter } from './schede';
import { isAlive } from './status.mjs';

export type Preview = { titolo: string; meta?: string; stato?: string; estratto?: string; immagine?: string };

type Data = Record<string, any>;
const join = (...parts: unknown[]) => parts.filter(Boolean).join(' · ') || undefined;

async function metaFor(collection: string): Promise<(id: string, data: Data) => string | undefined> {
  if (collection === 'personaggi') {
    const sheets = await sheetsByCharacter();
    // No player name: the card describes the character.
    return (id, data) => characterMeta({ ...data, giocatore: undefined }, sheets.get(id)?.at(-1)) || undefined;
  }
  return (_, data) =>
    ({
      sessions: () => `${config.labels.session} ${toRoman(data.numero)}`,
      png: () => data.ruolo,
      luoghi: () => join(data.tipo, data.regione),
      handout: () => data.fonte,
    })[collection]?.();
}

/** Every entry's link-preview card, keyed by its URL. */
export async function buildPreviews(): Promise<Record<string, Preview>> {
  const previews: Record<string, Preview> = {};
  for (const { key, single } of enabledCollections(config.features)) {
    if (single) continue;
    const meta = await metaFor(key);
    for (const { id, data } of await getCollection(key as CollectionKey)) {
      const d = data as Data;
      previews[entryUrl(key, id)] = {
        titolo: d.titolo,
        meta: meta(id, d),
        stato: d.stato && !isAlive(d.stato) ? d.stato : undefined,
        estratto: d.estratto,
        immagine: d.immagine,
      };
    }
  }
  return previews;
}
