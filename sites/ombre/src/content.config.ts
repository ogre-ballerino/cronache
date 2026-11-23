import { z } from 'astro/zod';
import { campaignCollections } from '@cronache/core/content';

export const collections = campaignCollections({
  sessions: { stagione: z.number().int().positive() },
  personaggi: { professione: z.string().optional(), sottotitolo: z.string().optional() },
});
