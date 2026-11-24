// Labels for the D&D 5e keys used by Foundry's dnd5e system. Game terms stay
// in English, as on Foundry and the printed sheet, so players read the same
// words everywhere; only the skill hints are Italian prose.

export const ABILITIES = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };

export const ABILITY_NAMES = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

// Skill key → [label, ability, hint], in the order of the printed sheet.
export const SKILLS = {
  acr: ['Acrobatics', 'dex', 'Restare in equilibrio, fare capriole, cadere bene, sgusciare via da una presa.'],
  ani: ['Animal Handling', 'wis', 'Calmare un animale, guidare una cavalcatura, capire cosa vuole una bestia.'],
  arc: ['Arcana', 'int', 'Sapere di incantesimi, oggetti magici, simboli arcani, piani di esistenza.'],
  ath: ['Athletics', 'str', 'Arrampicarsi, saltare, nuotare, lottare e spingere.'],
  dec: ['Deception', 'cha', 'Mentire in modo convincente e nascondere le proprie intenzioni.'],
  his: ['History', 'int', 'Ricordare eventi passati, regni, guerre e figure leggendarie.'],
  ins: ['Insight', 'wis', 'Capire le vere intenzioni di qualcuno, accorgersi di una bugia.'],
  itm: ['Intimidation', 'cha', 'Ottenere ciò che si vuole con minacce e prepotenza.'],
  inv: ['Investigation', 'int', 'Cercare indizi, esaminare luoghi e documenti, trarre deduzioni.'],
  med: ['Medicine', 'wis', 'Stabilizzare un morente, riconoscere malattie e ferite.'],
  nat: ['Nature', 'int', 'Conoscere terreni, piante, animali, clima e cicli naturali.'],
  prc: ['Perception', 'wis', 'Notare ciò che succede intorno: vedere, sentire, accorgersi di una presenza.'],
  prf: ['Performance', 'cha', 'Intrattenere un pubblico con musica, recitazione, danza o racconti.'],
  per: ['Persuasion', 'cha', 'Convincere qualcuno con tatto, cortesia e buona fede.'],
  rel: ['Religion', 'int', 'Conoscere divinità, riti, preghiere, culti e simboli sacri.'],
  slt: ['Sleight of Hand', 'dex', 'Borseggiare, nascondere un oggetto addosso, giochi di prestigio.'],
  ste: ['Stealth', 'dex', 'Nascondersi e muoversi senza farsi vedere né sentire.'],
  sur: ['Survival', 'wis', 'Seguire tracce, cacciare, orientarsi, prevedere il tempo.'],
};

export const CLASSES = {
  barbarian: 'Barbarian',
  bard: 'Bard',
  cleric: 'Cleric',
  druid: 'Druid',
  fighter: 'Fighter',
  monk: 'Monk',
  paladin: 'Paladin',
  ranger: 'Ranger',
  rogue: 'Rogue',
  sorcerer: 'Sorcerer',
  warlock: 'Warlock',
  wizard: 'Wizard',
};

export const ARMOR = { lgt: 'Light armor', med: 'Medium armor', hvy: 'Heavy armor', shl: 'Shields' };

export const WEAPONS = {
  sim: 'Simple weapons',
  mar: 'Martial weapons',
  club: 'Clubs',
  dagger: 'Daggers',
  dart: 'Darts',
  greatclub: 'Greatclubs',
  handaxe: 'Handaxes',
  handcrossbow: 'Hand crossbows',
  heavycrossbow: 'Heavy crossbows',
  javelin: 'Javelins',
  lightcrossbow: 'Light crossbows',
  lighthammer: 'Light hammers',
  longbow: 'Longbows',
  longsword: 'Longswords',
  mace: 'Maces',
  quarterstaff: 'Quarterstaffs',
  rapier: 'Rapiers',
  scimitar: 'Scimitars',
  shortbow: 'Shortbows',
  shortsword: 'Shortswords',
  sickle: 'Sickles',
  sling: 'Slings',
  spear: 'Spears',
  whip: 'Whips',
};

export const TOOLS = {
  thief: "Thieves' tools",
  herb: 'Herbalism kit',
  disg: 'Disguise kit',
  forg: 'Forgery kit',
  pois: "Poisoner's kit",
  navg: "Navigator's tools",
  alchemist: "Alchemist's supplies",
  calligrapher: "Calligrapher's supplies",
  dice: 'Dice set',
  card: 'Playing card set',
  chess: 'Dragonchess set',
  land: 'Vehicles (land)',
  water: 'Vehicles (water)',
};

export const LANGUAGES = {
  common: 'Common',
  dwarvish: 'Dwarvish',
  elvish: 'Elvish',
  giant: 'Giant',
  gnomish: 'Gnomish',
  goblin: 'Goblin',
  halfling: 'Halfling',
  orc: 'Orc',
  abyssal: 'Abyssal',
  celestial: 'Celestial',
  deep: 'Deep Speech',
  draconic: 'Draconic',
  infernal: 'Infernal',
  primordial: 'Primordial',
  sylvan: 'Sylvan',
  undercommon: 'Undercommon',
  cant: "Thieves' Cant",
  druidic: 'Druidic',
};

export const SENSES = { darkvision: 'Darkvision', blindsight: 'Blindsight', tremorsense: 'Tremorsense', truesight: 'Truesight' };

export const FEATURE_SOURCES = { classe: 'Class', razza: 'Race', background: 'Background', talento: 'Feats' };

export const RECOVERY = { lr: 'long rest', sr: 'short rest', day: 'day', dawn: 'dawn' };

/** The label for a key, or the key itself when it isn't mapped. */
export const label = (map, key) => map[key] ?? key;

/** "Rogue 6 (Swashbuckler)", multiclasses joined by a slash. */
export const classLine = (sheet) =>
  sheet.classi.map((c) => `${c.nome} ${c.livelli}${c.sottoclasse ? ` (${c.sottoclasse})` : ''}`).join(' / ');
