import { getCollection } from 'astro:content';
import config from 'virtual:cronache/config';
import { entryUrl } from './collections.mjs';
import { SYSTEMS, snapshotSlug, type SheetData, type SheetSystem } from './scheda/systems';

export interface SheetEntry {
  character: string;
  /** The snapshot's file name without extension, e.g. livello-06. */
  slug: string;
  data: SheetData;
}

export function sheetSystem(): SheetSystem | undefined {
  const name = config.features.schede;
  if (!name) return undefined;
  const system = SYSTEMS[name];
  if (!system) throw new Error(`[schede] unknown system "${name}": use one of ${Object.keys(SYSTEMS).join(', ')}`);
  return system;
}

/** Every snapshot of every character, oldest first, keyed by character id. */
export async function sheetsByCharacter(): Promise<Map<string, SheetEntry[]>> {
  const byCharacter = new Map<string, SheetEntry[]>();
  const system = sheetSystem();
  if (!system) return byCharacter;
  for (const entry of await getCollection('schede' as never)) {
    const { id, data } = entry as unknown as { id: string; data: SheetData };
    const character = id.split('/')[0];
    byCharacter.set(character, [...(byCharacter.get(character) ?? []), { character, slug: snapshotSlug(system, data), data }]);
  }
  for (const list of byCharacter.values()) list.sort((a, b) => system.order(a.data) - system.order(b.data));
  return byCharacter;
}

export const sheetUrl = (character: string) => `${entryUrl('personaggi', character)}scheda/`;

export const sheetPdfUrl = (sheet: SheetEntry) => `${sheetUrl(sheet.character)}${sheet.slug}.pdf`;

/** The downloaded file's name, so every player's PDF doesn't save as livello-06.pdf. */
export const sheetPdfName = (sheet: SheetEntry) => `${sheet.character}-${sheet.slug}.pdf`;
