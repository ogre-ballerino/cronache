import { defineCampaign } from '@cronache/core';

const name = "Porte sull'Oscurità";

export default defineCampaign({
  name,
  description:
    "Porte sull'Oscurità, cinque scenari di Call of Cthulhu: i rapporti degli investigatori, una porta dopo l'altra.",
  ogImageAlt: `${name}: una porta socchiusa, luce verdastra e tentacoli che escono dallo spiraglio`,
  css: [
    '@fontsource/im-fell-english/400.css',
    '@fontsource/im-fell-english/400-italic.css',
    '@fontsource/im-fell-english-sc/400.css',
    '@fontsource/spectral/400.css',
    '@fontsource/spectral/400-italic.css',
    '@fontsource/spectral/600.css',
    '@fontsource/special-elite/400.css',
    './src/styles/theme.css',
  ],
  features: { handout: true, schede: 'coc7e' },
  footer: {
    ornament: '',
    lines: [
      'Ospitato dall\'<a href="https://ogreballerino.com">Ogre Ballerino</a>',
      'Fatto con le manine sante di <a href="https://sirlisko.com">sirlisko</a> (alias <a href="/personaggi/maximilian-hirst/">Maximilian</a>)',
      'Le chiavi di tutte le porte le tiene Giuseppe, il Keeper',
      'Materiale amatoriale non ufficiale. Call of Cthulhu è un marchio registrato di Chaosium Inc.',
    ],
  },
  labels: { session: 'Capitolo', season: 'Avventura' },
  // One season per scenario: add the next one when the group opens its door.
  seasons: { 1: 'Genius Loci' },
  sections: {
    diario: {
      label: 'Capitoli',
      backlinks: 'Capitoli',
      heading: 'Capitoli',
      lede: 'I rapporti delle indagini, avventura per avventura.',
      description: "Tutti i capitoli di Porte sull'Oscurità, raggruppati per avventura, con il rapporto di ciò che gli investigatori hanno vissuto.",
    },
    personaggi: {
      label: 'Investigatori',
      lede: "Chi ha varcato la soglia, e cosa ne è rimasto.",
      description: "Gli investigatori di Porte sull'Oscurità: chi sono, che mestiere fanno e cosa hanno visto.",
      metaFields: ['professione', 'sottotitolo'],
    },
    png: {
      label: 'Comprimari',
      title: 'Comprimari',
      heading: 'Comprimari',
      lede: 'Alleati, sospetti e figure di cui è meglio non parlare.',
      description: 'Le persone incontrate dagli investigatori nel corso delle indagini.',
    },
    luoghi: {
      lede: 'Gli edifici, le città e i posti dove le indagini hanno portato.',
      description: "I luoghi visitati o sentiti nominare dagli investigatori in Porte sull'Oscurità.",
    },
    handout: {
      lede: "Documenti, lettere e fotografie, nell'ordine in cui sono arrivati sul tavolo.",
      description: 'I documenti e le fotografie che gli investigatori hanno avuto tra le mani.',
    },
    riassunto: {
      description: "Il riassunto di Porte sull'Oscurità: le indagini dall'inizio a oggi.",
    },
    cerca: {
      lede: 'Cerca tra capitoli, investigatori, comprimari, luoghi e handout.',
      description: "Cerca tra capitoli, investigatori, comprimari, luoghi e handout di Porte sull'Oscurità.",
      placeholder: 'Genius Loci, Jessica…',
    },
  },
});
