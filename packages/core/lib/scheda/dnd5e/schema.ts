import { z } from 'astro/zod';

// The compact sheet written by scripts/scheda.mjs (see lib/scheda/dnd5e/foundry.mjs).
// Hand edits are expected: the schema is what keeps them honest.

const ability = z.object({ valore: z.number().int(), mod: z.number().int(), salvezza: z.number().int(), competente: z.boolean() });
const abilityKey = z.enum(['str', 'dex', 'con', 'int', 'wis', 'cha']);

const spell = z.object({
  nome: z.string(),
  livello: z.number().int().min(0).max(9),
  preparato: z.boolean(),
  sempre: z.boolean(),
  usi: z.string().optional(),
  dettagli: z.record(z.string(), z.string()).default({}),
});

export const sheetSchema = z.object({
  livello: z.number().int().min(1).max(20),
  data: z.coerce.date(),
  sessione: z.number().int().positive().optional(),
  classi: z.array(
    z.object({ nome: z.string(), sottoclasse: z.string().optional(), livelli: z.number().int().positive(), dadoVita: z.number().int() })
  ),
  razza: z.string(),
  background: z.string(),
  allineamento: z.string(),
  pe: z.number().int(),
  competenza: z.number().int(),
  caratteristiche: z.record(abilityKey, ability),
  abilita: z.record(z.string(), z.object({ bonus: z.number().int(), competenza: z.number() })),
  pf: z.number().int(),
  ca: z.number().int(),
  iniziativa: z.number().int(),
  velocita: z.string(),
  sensi: z.array(z.string()),
  dadiVita: z.string(),
  percezionePassiva: z.number().int(),
  attacchi: z.array(z.object({ nome: z.string(), bonus: z.number().int(), danni: z.string() })),
  incantesimi: z
    .object({
      caratteristica: abilityKey,
      cd: z.number().int(),
      attacco: z.number().int(),
      slot: z.record(z.string(), z.number().int()),
      patto: z.object({ livello: z.number().int(), slot: z.number().int() }).nullable(),
      elenco: z.array(spell),
    })
    .nullable(),
  privilegi: z.array(
    z.object({
      nome: z.string(),
      fonte: z.enum(['classe', 'razza', 'background', 'talento']),
      usi: z.string().optional(),
      // SRD 5.1 text only (lib/scheda/dnd5e/srd.mjs): the site credits it under CC-BY-4.0.
      descrizione: z.string().optional(),
    })
  ),
  competenze: z.object({
    armature: z.array(z.string()),
    armi: z.array(z.string()),
    strumenti: z.array(z.string()),
    lingue: z.array(z.string()),
  }),
  equipaggiamento: z.array(
    z.object({ nome: z.string(), quantita: z.number(), magico: z.boolean(), sintonia: z.boolean().optional() })
  ),
  monete: z.object({ mp: z.number(), mo: z.number(), me: z.number(), ma: z.number(), mr: z.number() }),
});

export type Sheet = z.infer<typeof sheetSchema>;
