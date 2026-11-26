import type { Preview } from './previews';

export const previewUrl = '/anteprime.json';

const el = (tag: string, className: string, text?: string) => {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
};

export function renderPreview({ titolo, meta, stato, estratto, immagine }: Preview) {
  const body = el('div', 'link-preview-body');
  body.append(el('p', 'link-preview-title', titolo));
  if (meta || stato) body.append(el('p', 'link-preview-meta', [meta, stato].filter(Boolean).join(' · ')));
  if (estratto) body.append(el('p', 'link-preview-excerpt', estratto));

  const fragment = document.createDocumentFragment();
  if (immagine) {
    const img = el('img', 'link-preview-image') as HTMLImageElement;
    img.src = immagine;
    img.alt = '';
    fragment.append(img);
  }
  fragment.append(body);
  return fragment;
}
