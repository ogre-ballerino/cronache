import type { APIRoute } from 'astro';
import { buildPreviews } from '../lib/previews';

export const GET: APIRoute = async () => Response.json(await buildPreviews());
