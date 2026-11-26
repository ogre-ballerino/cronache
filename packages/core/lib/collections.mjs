// Every collection the engine knows, in nav order. `key` is the folder under
// src/content and the Astro collection name; `section` is the key in
// config.sections and the URL base.
export const COLLECTIONS = [
  { key: 'riassunto', section: 'riassunto', single: true, feature: 'riassunto' },
  { key: 'sessions', section: 'diario' },
  { key: 'personaggi', section: 'personaggi' },
  { key: 'png', section: 'png' },
  { key: 'luoghi', section: 'luoghi' },
  { key: 'handout', section: 'handout', feature: 'handout' },
];

/** @param {Record<string, boolean>} features */
export const enabledCollections = (features) => COLLECTIONS.filter((c) => !c.feature || features[c.feature]);

export const collectionByKey = (key) => COLLECTIONS.find((c) => c.key === key);

// Trailing slashes match the built directories, the canonicals and the sitemap.
export const sectionUrl = (section) => `/${section}/`;

/** @param {string} key @param {string} [id] */
export function entryUrl(key, id) {
  const collection = collectionByKey(key);
  if (!collection) throw new Error(`Unknown collection: ${key}`);
  return collection.single ? sectionUrl(collection.section) : `/${collection.section}/${id}/`;
}
