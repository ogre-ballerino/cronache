import { z } from 'astro/zod';

// An investigator's sheet after a chapter (lib/scheda/coc7e/). Only the
// numbers: the backstory side of the sheet stays with the player.

const int = z.number().int();
const pool = z.object({ max: int, attuali: int.optional() });

export const sheetSchema = z.object({
  capitolo: int.positive(),
  data: z.coerce.date(),
  occupazione: z.string(),
  eta: int.optional(),
  // Years aged by other means than time, shown as "75 (+17)".
  invecchiamento: int.positive().optional(),
  caratteristiche: z.object({ str: int, con: int, siz: int, dex: int, app: int, int: int, pow: int, edu: int }),
  pf: pool,
  pm: pool,
  fortuna: z.object({ iniziale: int, attuale: int.optional() }),
  sanita: z.object({ iniziale: int, attuale: int.optional(), massima: int.optional(), soglia: int.optional() }),
  stati: z.array(z.enum(['folliaTemporanea', 'folliaIndefinita', 'feritaGrave', 'privoDiSensi', 'morente'])).default([]),
  movimento: int,
  corporatura: int,
  bonusDanno: z.string(),
  // Only skills above their base value. Improvement checks are left out: they
  // only last until the next development phase.
  abilita: z.array(z.object({ nome: z.string(), specialita: z.string().optional(), valore: int })),
  armi: z
    .array(
      z.object({
        nome: z.string(),
        valore: int,
        danni: z.string(),
        attacchi: z.string().optional(),
        gittata: z.string().optional(),
        munizioni: z.string().optional(),
        malfunzionamento: z.string().optional(),
      })
    )
    .default([]),
});

export type CocSheet = z.infer<typeof sheetSchema>;
