import { defineCampaign } from '@cronache/core';
import { ogreBallerinoAbout, ogreBallerinoUmami } from '../ogre-ballerino.mjs';

export default defineCampaign({
  name: 'La Maledizione di Strahd',
  description:
    'Il diario di campagna di Curse of Strahd: sessioni, personaggi, PNG e luoghi di Barovia, raccontati dalla compagnia.',
  ogImageAlt: 'La Maledizione di Strahd: i ritratti dei quattro personaggi della compagnia',
  headerTitle: 'La Maledizione <em>di</em> Strahd',
  nav: [
    { href: '/riassunto/', label: 'Riassunto' },
    { href: '/diario/', label: 'Diario' },
    { href: '/personaggi/', label: 'Personaggi' },
    { href: '/png/', label: 'Png' },
    { href: '/luoghi/', label: 'Luoghi' },
    { href: '/mappa/', label: 'Mappa' },
    { href: '/cerca/', label: 'Cerca' },
  ],
  css: [
    '@fontsource/im-fell-english/400.css',
    '@fontsource/im-fell-english/400-italic.css',
    '@fontsource/im-fell-english-sc/400.css',
    '@fontsource/im-fell-dw-pica/400.css',
    '@fontsource/im-fell-dw-pica/400-italic.css',
    '@fontsource/im-fell-great-primer/400.css',
    './src/styles/theme.css',
  ],
  about: ogreBallerinoAbout('La Maledizione di Strahd'),
  umami: ogreBallerinoUmami('e4aeeac0-62c3-49c4-89bd-00c7494e142a'),
  footer: {
    ornament: '&#8258;',
    lines: [
      'Tenuto dalla compagnia, sessione dopo sessione · <a href="https://ogreballerino.com">ogreballerino.com</a>',
      'Fatto con le manine sante di <a href="https://sirlisko.com">sirlisko</a> (alias <a href="/personaggi/tariq/">Tariq</a>)',
    ],
  },
  nextSession: { endpoint: 'https://cms.sirlisko.com/items/strahd' },
  features: { schede: 'dnd5e' },
  sections: {
    png: { lede: 'Alleati, nemici e comparse incontrate a Barovia.' },
    luoghi: { lede: 'Villaggi, castelli, foreste e altri luoghi di Barovia.' },
    cerca: { placeholder: 'Strahd, Ireena, Vallaki…' },
  },
});
