import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import { enabledCollections } from './lib/collections.mjs';
import { resolveConfig } from './config.mjs';
import rehypeHeadingLinks from './lib/rehype-heading-links.mjs';
import remarkWikilinks from './lib/remark-wikilinks.mjs';
import { findUnresolvedLinks } from './lib/wikilinks.mjs';

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
  const sheets = features.schede
    ? [
        ['/personaggi/[id]/scheda', 'personaggi/scheda.astro'],
        ['/personaggi/[id]/scheda/livello-[livello].pdf', 'personaggi/scheda-pdf.ts'],
      ]
    : [];
  return [...pages, ...sheets, ['/cerca', 'cerca.astro']];
}

function virtualModules(config, { root, contentDir, publicDir, sheetTemplate }) {
  const require = createRequire(path.join(root, 'package.json'));
  // Relative paths are the site's own files; anything else is a package (fonts).
  const resolveCss = (spec) => (spec.startsWith('.') ? path.resolve(root, spec) : require.resolve(spec));
  const modules = {
    'virtual:cronache/config': `export default ${JSON.stringify(config)};`,
    'virtual:cronache/paths': [
      `export const contentDir = ${JSON.stringify(contentDir)};`,
      `export const publicDir = ${JSON.stringify(publicDir)};`,
      `export const sheetTemplate = ${JSON.stringify(sheetTemplate)};`,
    ].join('\n'),
    'virtual:cronache/styles': config.css.map((spec) => `import ${JSON.stringify(resolveCss(spec))};`).join('\n'),
  };
  return {
    name: 'cronache:virtual',
    resolveId: (id) => (id in modules ? `\0${id}` : undefined),
    load: (id) => (id.startsWith('\0') ? modules[id.slice(1)] : undefined),
  };
}

// A broken link renders as plain text and only warns while writing; a build
// must not publish it.
function assertLinksResolve(contentDir) {
  const unresolved = findUnresolvedLinks(contentDir);
  if (unresolved.length === 0) return;
  const list = unresolved.map(({ file, target }) => `  ${path.relative(contentDir, file)}: [[${target}]]`).join('\n');
  throw new Error(`[wikilinks] ${unresolved.length} unresolved link(s):\n${list}`);
}

/** @param {import('./config.mjs').CampaignConfig} userConfig */
export default function cronache(userConfig) {
  const config = resolveConfig(userConfig);
  return {
    name: '@cronache/core',
    hooks: {
      'astro:config:setup': ({ command, config: astroConfig, updateConfig, injectRoute }) => {
        const root = fileURLToPath(astroConfig.root);
        const paths = {
          root,
          contentDir: path.join(root, 'src', 'content'),
          publicDir: fileURLToPath(astroConfig.publicDir),
          sheetTemplate: fileURLToPath(new URL('./assets/scheda-5e.pdf', import.meta.url)),
        };
        if (command === 'build') assertLinksResolve(paths.contentDir);

        updateConfig({
          trailingSlash: 'always',
          integrations: [sitemap()],
          markdown: {
            processor: unified({
              remarkPlugins: [[remarkWikilinks, { contentDir: paths.contentDir }]],
              rehypePlugins: [rehypeHeadingIds, rehypeHeadingLinks],
            }),
          },
          vite: { plugins: [virtualModules(config, paths)] },
        });
        for (const [pattern, page] of routes(config.features)) {
          injectRoute({ pattern, entrypoint: `@cronache/core/pages/${page}` });
        }
      },
    },
  };
}
