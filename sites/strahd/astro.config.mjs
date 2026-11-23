// @ts-check
import { defineConfig } from 'astro/config';
import cronache from '@cronache/core';
import campaign from './campaign.config.mjs';

export default defineConfig({
  site: 'https://strahd.ogreballerino.com',
  output: 'static',
  integrations: [cronache(campaign)],
});
