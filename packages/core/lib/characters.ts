import config from 'virtual:cronache/config';
import { classLine } from './scheda/labels.mjs';
import type { Sheet } from './scheda/schema';

// Class and race from the latest sheet when there is one, otherwise the
// site's own descriptive fields (classe, professione…); then the player.
export function characterMeta(data: Record<string, unknown>, sheet?: Sheet): string {
  const description = sheet
    ? [classLine(sheet), sheet.razza]
    : config.sections.personaggi.metaFields.map((field) => data[field]);
  return [...description, data.giocatore && `Giocatore: ${data.giocatore}`].filter(Boolean).join(' · ');
}
