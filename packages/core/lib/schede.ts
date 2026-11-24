import { getCollection } from 'astro:content';
import config from 'virtual:cronache/config';
import { entryUrl } from './collections.mjs';
import type { Sheet } from './scheda/schema';

export interface SheetEntry {
  character: string;
  data: Sheet;
}

/** Every snapshot of every character, oldest level first, keyed by character id. */
export async function sheetsByCharacter(): Promise<Map<string, SheetEntry[]>> {
  const byCharacter = new Map<string, SheetEntry[]>();
  if (!config.features.schede) return byCharacter;
  for (const entry of await getCollection('schede' as never)) {
    const { id, data } = entry as unknown as { id: string; data: Sheet };
    const character = id.split('/')[0];
    byCharacter.set(character, [...(byCharacter.get(character) ?? []), { character, data }]);
  }
  for (const list of byCharacter.values()) list.sort((a, b) => a.data.livello - b.data.livello);
  return byCharacter;
}

export const sheetUrl = (character: string) => `${entryUrl('personaggi', character)}scheda/`;

export const sheetPdfUrl = (character: string, livello: number) => `${sheetUrl(character)}livello-${livello}.pdf`;

/** The downloaded file's name, so four players' PDFs don't all save as livello-6.pdf. */
export const sheetPdfName = (character: string, livello: number) => `${character}-livello-${livello}.pdf`;
