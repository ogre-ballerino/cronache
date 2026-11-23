import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import { enabledCollections } from './lib/collections.mjs';
import { resolveConfig } from './config.mjs';
import rehypeHeadingLinks from './lib/rehype-heading-links.mjs';
import remarkWikilinks from './lib/remark-wikilinks.mjs';

export { defineCampaign } from './config.mjs';

function routes(features) {
  const pages = enabledCollections(features).flatMap(({ section, single }) =>
    single
      ? [[`/${section}`, `${section}.astro`]]
      : [
          [`/${section}`, `${section}/index.astro`],
          [`/${section}/[id]`, `${section}/[id].astro`],
        ]
  );
  return [...pages, ['/cerca', 'cerca.astro']];
}

function virtualModules(config, root) {
  const require = createRequire(path.join(root, 'package.json'));
  // Relative paths are the site's own files; anything else is a package (fonts).
  const resolveCss = (spec) => (spec.startsWith('.') ? path.resolve(root, spec) : require.resolve(spec));
  const modules = {
    'virtual:cronache/config': `export default ${JSON.stringify(config)};`,
    'virtual:cronache/styles': config.css.map((spec) => `import ${JSON.stringify(resolveCss(spec))};`).join('\n'),
  };
  return {
    name: 'cronache:virtual',
    resolveId: (id) => (id in modules ? `\0${id}` : undefined),
    load: (id) => (id.startsWith('\0') ? modules[id.slice(1)] : undefined),
  };
}

/** @param {import('./config.mjs').CampaignConfig} userConfig */
export default function cronache(userConfig) {
  const config = resolveConfig(userConfig);
  return {
    name: '@cronache/core',
    hooks: {
      'astro:config:setup': ({ config: astroConfig, updateConfig, injectRoute }) => {
        updateConfig({
          integrations: [sitemap()],
          markdown: {
            processor: unified({
              remarkPlugins: [remarkWikilinks],
              rehypePlugins: [rehypeHeadingIds, rehypeHeadingLinks],
            }),
          },
          vite: { plugins: [virtualModules(config, fileURLToPath(astroConfig.root))] },
        });
        for (const [pattern, page] of routes(config.features)) {
          injectRoute({ pattern, entrypoint: `@cronache/core/pages/${page}` });
        }
      },
    },
  };
}
