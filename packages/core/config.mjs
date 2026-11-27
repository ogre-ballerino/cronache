import { enabledCollections, sectionUrl } from './lib/collections.mjs';
import { SHEET_TEXT } from './lib/scheda/text.mjs';

/**
 * @typedef {object} SectionText
 * @property {string} label        Nav entry, search filter and backlink group.
 * @property {string} [title]      Page <title>; defaults to `label`.
 * @property {string} [heading]    Page <h1>; defaults to `title`.
 * @property {string} [lede]
 * @property {string} [description] Meta description.
 */

/**
 * @typedef {object} CampaignConfig
 * @property {string} name               Site name, used in <title> and Open Graph.
 * @property {string} description        Default meta description.
 * @property {string} ogImageAlt         Alt text of /images/og.png.
 * @property {string} [headerTitle]      HTML of the header link on inner pages; defaults to `name`.
 * @property {{ href: string, label: string }[]} [nav]
 * @property {string[]} [css]            Stylesheets, in order: bare specifiers (fonts) or paths relative to the site root.
 * @property {{ riassunto?: boolean, handout?: boolean, schede?: false | 'dnd5e' | 'coc7e' }} [features]
 *   `riassunto`: the campaign overview page, on by default; off for sites of standalone adventures.
 *   `schede`: the game system of the character sheets shown under each character page (lib/scheda/systems.ts).
 * @property {{ ornament: string, lines: string[] }} [footer] Footer paragraphs as HTML.
 * @property {{ label: string, title: string, html: string }} [about]
 *   A "?" at the end of the nav opening a popover: `label` names the button, `html` is the body.
 * @property {({ endpoint: string } | { at: string }) & { calendar?: string }} [nextSession]
 *   `endpoint`: fetched in the browser, expects `{ start: ISO date | null }` (the Discord bot's `/next/<campaign>.json`).
 *   `at`: a fixed local wall-clock time, e.g. '2026-11-28T16:30:00'.
 *   `calendar`: a calendar feed to subscribe to (`webcal://…`), linked next to the date.
 * @property {DiscordConfig} [discord]
 *   The campaign's Discord bot (bots/discord): with it, the build publishes /bot.json, and the bot's deploy picks the campaign up.
 * @property {{ script: string, websiteId: string }} [umami]
 *   Umami tracking; only counted on the site's own domain, so `astro dev` and deploy previews stay out.
 * @property {Record<number, string>} [seasons]
 *   Season titles by `stagione` number, e.g. one per scenario; untitled seasons read "<labels.season> <roman>".
 * @property {Partial<typeof defaults.labels>} [labels]
 * @property {{ [K in keyof typeof defaults.sections]?: Partial<(typeof defaults.sections)[K]> }} [sections]
 */

/**
 * @typedef {object} DiscordConfig
 * @property {string} announcement Message posted with a new session.
 * @property {string} readMore     Text of the link at the end of the announcement.
 * @property {number} color        Embed colour, e.g. 0x6b4f2a.
 * @property {string} channel      ID of the Discord channel where `/next` sets this campaign's next session.
 * @property {string} event        Title of the session's calendar events.
 * @property {string} signature    Signs the bot's posts about the next session, e.g. an emoji.
 * @property {string} timezone     IANA timezone the dates given to `/next` are read in, e.g. 'Europe/London'.
 */

const defaults = {
  labels: {
    session: 'Sessione',
    season: 'Stagione',
    mentionedIn: 'Menzionato in',
    otherSessions: 'Altre sessioni',
    loot: 'Bottino',
    lootTaken: 'Bottino raccolto',
    nextSession: 'Prossima sessione',
    followCalendar: 'Segui il calendario',
    sheet: 'Scheda del personaggio',
    sheetDownload: 'Scarica il PDF',
    sheetBack: 'Torna al personaggio',
    sheetFirst: 'Prima scheda registrata.',
    /** The sheet pages' text for `features.schede`'s system: defaults in lib/scheda/text.mjs, override any key. */
    sheetText: /** @type {Record<string, string>} */ ({}),
  },
  sections: {
    diario: {
      label: 'Diario',
      backlinks: 'Sessioni',
      heading: 'Diario delle sessioni',
      lede: 'Il resoconto di ogni serata di gioco, dalla più recente.',
      description:
        "Il diario di tutte le sessioni della campagna, dalla prima all'ultima, con il racconto di ciò che la compagnia ha vissuto.",
    },
    personaggi: {
      label: 'Personaggi',
      lede: 'Gli avventurieri del gruppo.',
      description: 'I personaggi della compagnia: chi sono, da dove vengono e cosa hanno affrontato finora.',
      // Frontmatter fields shown first in a character's meta line.
      metaFields: ['classe'],
    },
    png: {
      label: 'Png',
      title: 'PNG',
      heading: 'Personaggi Non Giocanti',
      lede: 'Alleati, nemici e comparse incontrate lungo il cammino.',
      description: 'I personaggi non giocanti incontrati dalla compagnia: alleati, nemici e figure misteriose.',
    },
    luoghi: {
      label: 'Luoghi',
      lede: 'Villaggi, città e altri luoghi della campagna.',
      description: 'I luoghi visitati o sentiti nominare dalla compagnia nel corso della campagna.',
    },
    handout: {
      label: 'Handout',
      lede: "Documenti, fotografie e pagine, nell'ordine in cui sono arrivati sul tavolo.",
      description: 'I documenti e le immagini che la compagnia ha avuto tra le mani nel corso della campagna.',
    },
    riassunto: {
      label: 'Riassunto',
      description: "Il riassunto della campagna: la storia della compagnia dalle origini fino all'ultima sessione giocata.",
    },
    cerca: {
      label: 'Cerca',
      lede: 'Cerca tra sessioni, personaggi, png e luoghi.',
      description: 'Cerca tra sessioni, personaggi, PNG e luoghi della campagna.',
      placeholder: 'Cerca…',
    },
  },
};

/** @param {CampaignConfig} config */
export function defineCampaign(config) {
  return config;
}

/** @param {CampaignConfig} user */
export function resolveConfig(user) {
  const features = { riassunto: true, handout: false, schede: false, ...user.features };
  const sections = Object.fromEntries(
    Object.entries(defaults.sections).map(([key, base]) => {
      const merged = { ...base, ...user.sections?.[key] };
      merged.title ??= merged.label;
      merged.heading ??= merged.title;
      return [key, merged];
    })
  );
  const navKeys = [...enabledCollections(features).map((c) => c.section), 'cerca'];

  return {
    ...user,
    headerTitle: user.headerTitle ?? user.name,
    nav: user.nav ?? navKeys.map((key) => ({ href: sectionUrl(key), label: sections[key].label })),
    css: user.css ?? [],
    features,
    footer: user.footer ?? { ornament: '', lines: [] },
    about: user.about ?? null,
    nextSession: user.nextSession ?? null,
    umami: user.umami ?? null,
    discord: user.discord ?? null,
    seasons: user.seasons ?? {},
    labels: {
      ...defaults.labels,
      ...user.labels,
      sheetText: { ...(features.schede ? SHEET_TEXT[features.schede] : {}), ...user.labels?.sheetText },
    },
    sections,
  };
}

/** @typedef {ReturnType<typeof resolveConfig>} ResolvedCampaignConfig */
