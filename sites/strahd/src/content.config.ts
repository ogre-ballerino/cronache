import { z } from 'astro/zod';
import { campaignCollections } from '@cronache/core/content';

export const collections = campaignCollections({
  personaggi: { classe: z.string().optional() },
});
