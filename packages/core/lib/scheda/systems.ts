// Each game system the character sheets support: how its snapshots are named,
// ordered, summarized, compared and printed. `features.schede` picks one;
// its PDF template is packages/core/assets/scheda-<system>.pdf.

import { classLine } from './dnd5e/labels.mjs';
import { fillSheetPdf as fillDnd5e } from './dnd5e/pdf.mjs';
import { diffSheets as diffDnd5e } from './dnd5e/storico.mjs';
import { fillSheetPdf as fillCoc7e } from './coc7e/pdf.mjs';
import { diffSheets as diffCoc7e } from './coc7e/storico.mjs';
import { SNAPSHOTS } from './schemas';

export type SheetData = Record<string, any>;

export interface SheetSystem {
  /** Snapshot files in src/schede/<character>/, e.g. livello-06.json. */
  prefix: string;
  historyTitle: string;
  /** Orders snapshots; also the number in the file name. */
  order: (data: SheetData) => number;
  /** The session the snapshot follows, linked from the history. */
  session: (data: SheetData) => number | undefined;
  heading: (data: SheetData, sessionLabel: string) => string;
  /** The line under the name on the sheet page. */
  summary: (data: SheetData) => string[];
  /** Replaces the site's own descriptive fields in a character's meta line, when set. */
  meta?: (data: SheetData) => string[];
  diff: (prev: SheetData, next: SheetData) => { titolo: string; voci: string[] }[];
  fill: (template: Uint8Array, data: SheetData, meta: { nome: string; ritratto?: Uint8Array }) => Promise<Uint8Array>;
}

export const SYSTEMS: Record<string, SheetSystem> = {
  dnd5e: {
    prefix: SNAPSHOTS.dnd5e.prefix,
    historyTitle: 'Storico dei livelli',
    order: (d) => d.livello,
    session: (d) => d.sessione,
    heading: (d) => `Livello ${d.livello}`,
    summary: (d) => [classLine(d), d.razza, d.background],
    meta: (d) => [classLine(d), d.razza],
    diff: diffDnd5e,
    fill: fillDnd5e,
  },
  coc7e: {
    prefix: SNAPSHOTS.coc7e.prefix,
    historyTitle: 'Storico della scheda',
    order: (d) => d.capitolo,
    session: (d) => d.capitolo,
    heading: (d, sessionLabel) => `Dopo il ${sessionLabel.toLowerCase()} ${d.capitolo}`,
    summary: (d) => [d.occupazione, d.eta && `${d.eta} anni${d.invecchiamento ? ` (+${d.invecchiamento})` : ''}`],
    diff: diffCoc7e,
    fill: fillCoc7e,
  },
};

export const snapshotSlug = (system: SheetSystem, data: SheetData) => `${system.prefix}-${String(system.order(data)).padStart(2, '0')}`;
