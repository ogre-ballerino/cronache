import fs from 'node:fs';
import path from 'node:path';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import config from 'virtual:cronache/config';
import { publicDir } from 'virtual:cronache/paths';
import { STATI_PERSONAGGI, STATI_PNG } from './lib/status.mjs';
import { curlyQuotes } from './lib/wikilinks.mjs';
import { SNAPSHOTS } from './lib/scheda/schemas';
import { COINS } from './lib/loot.mjs';

type Fields = Record<string, z.ZodTypeAny>;

// Site-specific fields per collection; they can also override a core field.
export interface CollectionFields {
  sessions?: Fields;
  personaggi?: Fields;
  png?: Fields;
  luoghi?: Fields;
  handout?: Fields;
}

const publicFile = z
  .string()
  .refine((src) => fs.existsSync(path.join(publicDir, src)), { error: (issue) => `${issue.input} not found in public/` });

const baseFields = {
  titolo: z.string(),
  estratto: z.string().max(300).transform(curlyQuotes).optional(),
  immagine: z.string().optional(),
  anteprima: publicFile.optional(),
  tag: z.array(z.string()).default([]),
};

// Top-level files only, as the wikilink slug map reads them; `_` marks a draft.
const loader = (collection: string) => glob({ pattern: '[^_]*.md', base: `./src/content/${collection}` });

const coins = z.object(Object.fromEntries(COINS.map(([key]) => [key, z.number().int().positive().optional()]))).strict();

const loot = z
  .object({
    monete: coins.optional(),
    // `chi`: who took the item, by name; omitted when the group shares it.
    oggetti: z.array(z.object({ nome: z.string().transform(curlyQuotes), chi: z.string().optional() }).strict()).default([]),
  })
  .strict();

const collection = (name: string, fields: Fields, extra: Fields = {}) =>
  defineCollection({ loader: loader(name), schema: z.object({ ...baseFields, ...fields, ...extra }) });

function sheetCollection(system: string) {
  const snapshot = SNAPSHOTS[system as keyof typeof SNAPSHOTS];
  if (!snapshot) throw new Error(`[schede] unknown system "${system}": use one of ${Object.keys(SNAPSHOTS).join(', ')}`);
  return defineCollection({ loader: glob({ pattern: `*/${snapshot.prefix}-*.json`, base: './src/schede' }), schema: snapshot.schema });
}

export function campaignCollections(extra: CollectionFields = {}) {
  const collections = {
    sessions: collection(
      'sessions',
      {
        numero: z.number().int().positive(),
        stagione: z.number().int().positive().optional(),
        data: z.coerce.date(),
        luoghiVisitati: z.array(z.string()).default([]),
        bottino: loot.optional(),
      },
      extra.sessions
    ),
    personaggi: collection(
      'personaggi',
      {
        giocatore: z.string().optional(),
        stato: z.enum(STATI_PERSONAGGI as [string, ...string[]]).default('vivo'),
        fazione: z.string().optional(),
      },
      extra.personaggi
    ),
    png: collection(
      'png',
      {
        ruolo: z.string().transform(curlyQuotes).optional(),
        stato: z.enum(STATI_PNG as [string, ...string[]]).default('vivo'),
        fazione: z.string().optional(),
        luogo: z.string().optional(),
      },
      extra.png
    ),
    luoghi: collection('luoghi', { tipo: z.string().optional(), regione: z.string().optional() }, extra.luoghi),
  };
  return {
    ...collections,
    ...(config.features.riassunto && {
      riassunto: defineCollection({ loader: loader('riassunto'), schema: z.object({ titolo: z.string() }) }),
    }),
    ...(config.features.handout && {
      handout: collection(
        'handout',
        { capitolo: z.number().int().positive(), fonte: z.string().optional() },
        extra.handout
      ),
    }),
    // Snapshots per character: src/schede/<character id>/livello-NN.json (dnd5e), capitolo-NN.json (coc7e).
    ...(config.features.schede && { schede: sheetCollection(config.features.schede) }),
  };
}
