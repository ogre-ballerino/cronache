import { getCollection, type CollectionKey } from 'astro:content';
import config from 'virtual:cronache/config';
import { contentDir } from 'virtual:cronache/paths';
import { enabledCollections, entryUrl } from './collections.mjs';
import { getSlugMap, normalize, WIKILINK_RE } from './wikilinks.mjs';

type Backlink = { title: string; url: string; collection: string; numero?: number };

let backlinkCache: Map<string, Backlink[]> | null = null;

async function buildBacklinkIndex() {
  const index = new Map<string, Backlink[]>();
  const slugMap = getSlugMap(contentDir);

  for (const { key } of enabledCollections(config.features)) {
    const entries = await getCollection(key as CollectionKey);
    for (const entry of entries) {
      const sourceEntry = { title: entry.data.titolo, url: entryUrl(key, entry.id) };

      const names = [...(entry.body ?? '').matchAll(WIKILINK_RE)].map((m) => m[1]);
      // Sessions often name the place they're in as plain text.
      if ('luoghiVisitati' in entry.data) names.push(...entry.data.luoghiVisitati);

      for (const name of names) {
        const target = slugMap.get(normalize(name));
        if (!target || target.url === sourceEntry.url) continue;
        const list = index.get(target.url) ?? [];
        if (!list.some((l) => l.url === sourceEntry.url)) {
          list.push({
            title: sourceEntry.title,
            url: sourceEntry.url,
            collection: key,
            numero: 'numero' in entry.data ? entry.data.numero : undefined,
          });
        }
        index.set(target.url, list);
      }
    }
  }
  return index;
}

export async function getBacklinksFor(url: string): Promise<Backlink[]> {
  if (!backlinkCache) backlinkCache = await buildBacklinkIndex();
  return backlinkCache.get(url) ?? [];
}
