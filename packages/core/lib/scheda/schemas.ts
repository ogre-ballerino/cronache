// The snapshot schemas and file prefixes per system, kept apart from
// systems.ts so the content config doesn't load the PDF code.
import { sheetSchema as coc7e } from './coc7e/schema';
import { sheetSchema as dnd5e } from './dnd5e/schema';

export const SNAPSHOTS = {
  dnd5e: { prefix: 'livello', schema: dnd5e },
  coc7e: { prefix: 'capitolo', schema: coc7e },
} as const;
