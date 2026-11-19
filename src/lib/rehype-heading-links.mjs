import { visit } from 'unist-util-visit';

const LINKED = new Set(['h2', 'h3']);

// Expects ids already set: run after Astro's rehypeHeadingIds.
export default function rehypeHeadingLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (!LINKED.has(node.tagName) || !node.properties?.id) return;
      // A heading that already contains a link (e.g. a wikilink) can't be wrapped: nested <a> is invalid.
      let hasLink = false;
      visit(node, 'element', (child) => {
        if (child.tagName === 'a') hasLink = true;
      });
      if (hasLink) return;
      node.children = [
        {
          type: 'element',
          tagName: 'a',
          properties: { href: `#${node.properties.id}`, className: ['heading-link'] },
          children: node.children,
        },
      ];
    });
  };
}
