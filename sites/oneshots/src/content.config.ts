import { z } from 'astro/zod';
import { campaignCollections } from '@cronache/core/content';
import { systemIds } from './lib/systems';

const sistema = z.enum(systemIds).default('dnd5e');

export const collections = campaignCollections({
  sessions: {
    sistema,
    livello: z.number().int().positive().optional(),
    ambientazione: z.string().optional(),
    fonte: z.string().optional(),
    master: z.string().optional(),
    personaggi: z.array(z.string()).default([]),
    esito: z.enum(['compiuta', 'fallita', 'in corso']).optional(),
  },
  personaggi: { classe: z.string().optional(), razza: z.string().optional(), sistema },
});
