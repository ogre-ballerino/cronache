// @ts-check
import { defineConfig } from 'astro/config';
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import rehypeHeadingLinks from './src/lib/rehype-heading-links.mjs';
import remarkWikilinks from './src/lib/remark-wikilinks.mjs';

export default defineConfig({
  site: 'https://strahd.ogreballerino.com',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkWikilinks],
      rehypePlugins: [rehypeHeadingIds, rehypeHeadingLinks],
    }),
  },
});
