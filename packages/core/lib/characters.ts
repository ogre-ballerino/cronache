import config from 'virtual:cronache/config';
import { sheetSystem, type SheetEntry } from './schede';

// What the latest sheet says (class and race for D&D) when the system has it,
// otherwise the site's own descriptive fields (classe, professione…); then the player.
export function characterMeta(data: Record<string, unknown>, sheet?: SheetEntry): string {
  const fromSheet = sheet && sheetSystem()?.meta?.(sheet.data);
  const description = fromSheet ?? config.sections.personaggi.metaFields.map((field) => data[field]);
  return [...description, data.giocatore && `Giocatore: ${data.giocatore}`].filter(Boolean).join(' · ');
}
