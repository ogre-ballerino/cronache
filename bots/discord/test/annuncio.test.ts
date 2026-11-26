import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { announcement, sameSession } from '../src/annuncio.ts';

const bot = {
  annuncio: '🦇 Nuovo capitolo!',
  leggi: 'Leggi il diario',
  colore: 0x6b4f2a,
  ultima: {
    url: 'https://strahd.ogreballerino.com/diario/sessione-16/',
    titolo: 'I cavalieri del drago',
    etichetta: 'Sessione XVI',
    data: '25 novembre 2026',
    estratto: 'Il gruppo lascia Vallaki.',
    immagine: 'https://strahd.ogreballerino.com/images/sessioni/sessione-16.png',
  },
};

describe('announcement', () => {
  it('posts the session as an embed with its woodcut', () => {
    const { content, embeds } = announcement(bot);
    assert.equal(content, '🦇 Nuovo capitolo!');
    assert.deepEqual(embeds[0], {
      title: 'I cavalieri del drago',
      url: bot.ultima.url,
      description: `Il gruppo lascia Vallaki.\n\n[Leggi il diario](${bot.ultima.url})`,
      color: 0x6b4f2a,
      image: { url: bot.ultima.immagine },
      footer: { text: 'Sessione XVI · 25 novembre 2026' },
    });
  });

  it('leaves out the blank line when there is no excerpt', () => {
    const { embeds } = announcement({ ...bot, ultima: { ...bot.ultima, estratto: '' } });
    assert.equal(embeds[0].description, `[Leggi il diario](${bot.ultima.url})`);
  });
});

describe('sameSession', () => {
  it('ignores the trailing slash', () => {
    assert.ok(sameSession('https://x.com/diario/sessione-16', 'https://x.com/diario/sessione-16/'));
    assert.ok(!sameSession('https://x.com/diario/sessione-15/', 'https://x.com/diario/sessione-16/'));
    assert.ok(!sameSession(undefined, 'https://x.com/diario/sessione-16/'));
  });
});
