// A place's card reuses a session's woodcut: its cartouche names the place, and
// the session that showed it, instead of the session.

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function frontmatter(markdown) {
  const block = markdown.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const field = (key) =>
    block
      .match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1]
      .trim()
      .replace(/^(['"])(.*)\1$/, '$2');
  return { titolo: field('titolo'), tipo: field('tipo'), regione: field('regione') };
}

export function placeCartouche(html, markdown) {
  const { titolo, tipo, regione } = frontmatter(markdown);
  if (!titolo) throw new Error('The place has no titolo');
  // The session's <title> is "<Sessione IV> · <its title>": the cartouche keeps where it was seen.
  const session = html.match(/<title>([^<·]+)·/)?.[1].trim();
  const kind = [tipo, regione].filter(Boolean).join(' · ');
  const cartouche = [
    '<div class="cartouche">',
    kind && `      <p class="number">${escape(kind)}</p>`,
    `      <h1 class="title">${escape(titolo)}</h1>`,
    session && `      <p class="where">${escape(session)}</p>`,
    '    </div>',
  ]
    .filter(Boolean)
    .join('\n');
  const replaced = html
    .replace(/<div class="cartouche">[\s\S]*?<\/div>/, cartouche)
    .replace('<main class="card">', '<main class="card place">');
  if (replaced === html) throw new Error('The woodcut has no cartouche to replace');
  return replaced;
}

export function setAnteprima(markdown, src) {
  const [, block, body] = markdown.match(/^---\n([\s\S]*?)\n---([\s\S]*)$/);
  const lines = block.split('\n').filter((line) => !line.startsWith('anteprima:'));
  return `---\n${[...lines, `anteprima: ${src}`].join('\n')}\n---${body}`;
}
