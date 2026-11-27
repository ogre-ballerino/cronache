import fs from 'node:fs';
import satori from 'satori';

// The typographic link-preview card of an entry without an image of its own:
// the site's paper, a double rule, kind, title, excerpt and the site's name.

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

const h = (type, style, children) => ({ type, props: { style, children } });

// Long names shrink rather than wrap onto a third line.
const titleSize = (title) => (title.length <= 20 ? 104 : title.length <= 30 ? 86 : 70);

/**
 * @param {{ kind: string, title: string, excerpt?: string, footer: string }} text
 * @param {ReturnType<typeof import('./card-style.mjs').cardStyle>} style
 */
export function cardTree({ kind, title, excerpt, footer }, { colors, display, body }) {
  const frame = (inset, color) => h('div', { position: 'absolute', inset, border: `1px solid ${color}` });
  const caps = { fontFamily: display, textTransform: 'uppercase', display: 'block', lineClamp: 1 };
  return h(
    'div',
    { width: CARD_WIDTH, height: CARD_HEIGHT, display: 'flex', background: colors.bg, color: colors.ink },
    [
      frame(22, colors.ink),
      frame(30, colors.rule),
      h(
        'div',
        {
          position: 'absolute',
          inset: '30px 110px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        },
        [
          kind && h('div', { ...caps, fontSize: 22, letterSpacing: 6, color: colors.rubric }, kind),
          h('div', { fontFamily: display, fontSize: titleSize(title), lineHeight: 1.05, marginTop: 14 }, title),
          excerpt &&
            h(
              'div',
              {
                fontFamily: body,
                fontStyle: 'italic',
                fontSize: 30,
                lineHeight: 1.3,
                marginTop: 26,
                color: colors['ink-muted'],
                display: 'block',
                lineClamp: 3,
              },
              excerpt
            ),
        ].filter(Boolean)
      ),
      h('div', { ...caps, position: 'absolute', left: 110, bottom: 58, fontSize: 18, letterSpacing: 4, color: colors['ink-muted'] }, footer),
    ]
  );
}

let fontData;
const loadFonts = (fonts) =>
  (fontData ??= fonts.map(({ name, style, weight, file }) => ({ name, style, weight, data: fs.readFileSync(file) })));

// Text comes out as paths, so the SVG rasterizes without the fonts installed.
export const cardSvg = (text, style) =>
  satori(cardTree(text, style), { width: CARD_WIDTH, height: CARD_HEIGHT, fonts: loadFonts(style.fonts) });
