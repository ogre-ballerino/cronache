import { defineCampaign } from '@cronache/core';
import { ogreBallerinoAbout } from '../ogre-ballerino.mjs';

const name = "La Bacheca dell'Ogre";

export default defineCampaign({
  name,
  description:
    "Le one-shot giocate all'Ogre Ballerino: ogni avventura appesa alla bacheca, con i personaggi che l'hanno vissuta, i PNG incontrati e i luoghi attraversati.",
  ogImageAlt: `${name}: avvisi di avventura appesi a una bacheca di legno`,
  css: [
    '@fontsource/cinzel/400.css',
    '@fontsource/cinzel/700.css',
    '@fontsource/lora/400.css',
    '@fontsource/lora/400-italic.css',
    '@fontsource/lora/600.css',
    './src/styles/theme.css',
    './src/styles/board.css',
  ],
  features: { riassunto: false },
  about: ogreBallerinoAbout(name),
  footer: {
    ornament: '',
    lines: [
      'Avvisi appesi all\'<a href="https://ogreballerino.com">Ogre Ballerino</a>, una serata alla volta',
      'Fatto con le manine sante di <a href="https://sirlisko.com">sirlisko</a> (alias <a href="/personaggi/pip/">Pip</a>)',
    ],
  },
  labels: { session: 'Avviso', otherSessions: 'Altre avventure' },
  sections: {
    diario: {
      label: 'Avventure',
      backlinks: 'Avventure',
      heading: 'Avventure',
      lede: 'Ogni one-shot giocata, dalla più recente.',
      description: 'Tutte le one-shot appese alla bacheca, dalla più recente, con il racconto di ciò che è successo.',
    },
    personaggi: {
      lede: 'Gli avventurieri passati dalla bacheca.',
      description: 'I personaggi che hanno giocato le one-shot della bacheca: chi sono e cosa hanno affrontato.',
      metaFields: ['classe', 'razza'],
    },
    png: {
      heading: 'Personaggi non giocanti',
      lede: 'Alleati, nemici e comparse incontrati nelle avventure.',
      description: 'I personaggi non giocanti incontrati nelle one-shot: alleati, nemici e comparse.',
    },
    luoghi: {
      lede: 'Città, dungeon, locande e terre selvagge attraversati nelle avventure.',
      description: 'I luoghi attraversati o sentiti nominare nelle one-shot della bacheca.',
    },
    cerca: {
      lede: 'Cerca tra avventure, personaggi, PNG e luoghi.',
      description: 'Cerca tra avventure, personaggi, PNG e luoghi della bacheca.',
      placeholder: 'Fogbrooke, Pip…',
    },
  },
});
