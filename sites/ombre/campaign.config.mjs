import { defineCampaign } from '@cronache/core';
import { ogreBallerinoAbout, ogreBallerinoUmami } from '../ogre-ballerino.mjs';

const name = "L'Equilibrio delle Ombre";

export default defineCampaign({
  name,
  description:
    "L'Equilibrio delle Ombre, una campagna di Call of Cthulhu: cronaca di quanto vedemmo, e di quanto preferiremmo dimenticare.",
  ogImageAlt: `${name}: il titolo della campagna e i simboli di Hans`,
  css: [
    '@fontsource/cormorant-garamond/400.css',
    '@fontsource/cormorant-garamond/400-italic.css',
    '@fontsource/cormorant-garamond/600.css',
    '@fontsource/unifrakturmaguntia/400.css',
    '@fontsource/reenie-beanie/400.css',
    './src/styles/theme.css',
  ],
  features: { handout: true, schede: 'coc7e' },
  about: ogreBallerinoAbout(name),
  umami: ogreBallerinoUmami('4e1d5a17-28bf-4430-afa5-701ffe753d37'),
  footer: {
    ornament: '&#10022; &#10022; &#10022;',
    lines: [
      'Tenuto dagli investigatori superstiti · <a href="https://ogreballerino.com">ogreballerino.com</a>',
      'Fatto con le manine sante di <a href="https://sirlisko.com">sirlisko</a> (alias <a href="/personaggi/agatha-fletcher/">Agatha</a>)',
      'Materiale amatoriale non ufficiale. Call of Cthulhu è un marchio registrato di Chaosium Inc.',
    ],
  },
  // Wall-clock time; the home page hides it once it has passed.
  nextSession: { at: '2026-11-28T16:30:00' },
  labels: { session: 'Capitolo' },
  sections: {
    diario: {
      label: 'Capitoli',
      backlinks: 'Capitoli',
      heading: 'Capitoli',
      description:
        "Tutte le sessioni della campagna, dalla prima all'ultima, con il racconto di ciò che gli investigatori hanno vissuto.",
    },
    personaggi: {
      label: 'Investigatori',
      lede: 'Coloro che hanno indagato, e ciò che ne è rimasto.',
      description: 'Gli investigatori della campagna: chi sono, da dove vengono e cosa hanno visto.',
      metaFields: ['professione', 'sottotitolo'],
    },
    png: {
      label: 'Comprimari',
      title: 'Comprimari',
      heading: 'Comprimari',
      lede: 'Alleati, nemici e comparse incontrate lungo le indagini.',
      description: 'Le persone incontrate dagli investigatori: alleati, nemici e figure di cui è meglio non parlare.',
    },
    luoghi: {
      lede: 'Città, case, biblioteche e altri luoghi, dagli Stati Uniti a Berlino.',
      description: 'I luoghi visitati o sentiti nominare dagli investigatori nel corso della campagna.',
    },
    handout: {
      lede: "Documenti, fotografie e pagine strappate, nell'ordine in cui sono arrivati sul tavolo.",
      description:
        'I documenti, le fotografie e le pagine che gli investigatori hanno avuto tra le mani nel corso della campagna.',
    },
    riassunto: {
      description: "Il riassunto della campagna: la storia delle indagini dall'inizio alla fine.",
    },
    cerca: {
      lede: 'Cerca tra capitoli, investigatori, comprimari, luoghi e handout.',
      description: 'Cerca tra capitoli, investigatori, comprimari, luoghi e handout della campagna.',
      placeholder: 'Arkham, Berlino…',
    },
  },
});
