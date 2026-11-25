// The "?" popover every Ogre Ballerino site shares: who we are, and how to get a journal like this.

const EMAIL = 'luca@ogreballerino.com';

const CHRONICLES = [
  { name: 'La Maledizione di Strahd', url: 'https://strahd.ogreballerino.com/', game: 'D&amp;D 5e' },
  { name: "L'Equilibrio delle Ombre", url: 'https://ombre.ogreballerino.com/', game: 'Call of Cthulhu, campagna' },
  { name: "Porte sull'Oscurità", url: 'https://porte.ogreballerino.com/', game: 'Call of Cthulhu, cinque scenari' },
  { name: "La Bacheca dell'Ogre", url: 'https://oneshots.ogreballerino.com/', game: 'one-shot di ogni genere' },
];

// The questions save a round of replies: they tell whether the journal fits the group.
const MAIL_BODY = 'Ciao sirlisko,\n\nche gioco fate?\nOgni quanto giocate?\nRegistrate le sessioni o prendete appunti?\n';

/** @param {string} siteName The site's `name`: it goes in the mail subject, to tell which site the request came from. */
export function ogreBallerinoAbout(siteName) {
  const subject = `Un diario per il mio gruppo (da ${siteName})`;
  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(MAIL_BODY)}`;
  const others = CHRONICLES.filter((c) => c.name !== siteName)
    .map((c) => `<li><a href="${c.url}">${c.name}</a> <small>${c.game}</small></li>`)
    .join('');

  return {
    label: "Cos'è questo sito?",
    title: "Cos'è questo sito?",
    html: [
      '<p>L\'<a href="https://ogreballerino.com">Ogre Ballerino</a> è un gruppo di amici che gioca di ruolo. Ogni campagna ha il suo diario: dopo ogni sessione si aggiunge un capitolo, e personaggi, luoghi e documenti si collegano tra loro, così si può ritrovare chi era quel tizio di tre sessioni fa.</p>',
      `<p>Vuoi un diario così anche per il tuo gruppo? Basta la registrazione delle vostre sessioni, una trascrizione o anche solo gli appunti: <a href="${mailto}">chiedi a sirlisko</a> (${EMAIL}).</p>`,
      `<p class="site-about-more">Le altre cronache</p><ul>${others}</ul>`,
    ].join(''),
  };
}
