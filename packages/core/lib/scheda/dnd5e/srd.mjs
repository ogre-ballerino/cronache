// Feature descriptions may be published only when the feature is in the
// SRD 5.1 (CC-BY-4.0). Foundry's text for it is kept only when it comes from
// the 2014 PHB, whose wording the SRD reproduces; other sources (Unearthed
// Arcana, homebrew, 2024 rules) differ and stay off the site.

// SRD 5.1 class, subclass, race, background and feat features, by the name
// Foundry gives them (prefixes like "Eldritch Invocations: " and suffixes like
// " (CR 1/2)" are stripped before matching).
const SRD_FEATURES = new Set([
  // Barbarian, Path of the Berserker
  'Rage', 'Unarmored Defense', 'Reckless Attack', 'Danger Sense', 'Extra Attack', 'Fast Movement', 'Feral Instinct',
  'Brutal Critical', 'Relentless Rage', 'Persistent Rage', 'Indomitable Might', 'Primal Champion', 'Frenzy',
  'Mindless Rage', 'Intimidating Presence', 'Retaliation',
  // Bard, College of Lore
  'Bardic Inspiration', 'Jack of All Trades', 'Song of Rest', 'Expertise', 'Font of Inspiration', 'Countercharm',
  'Magical Secrets', 'Superior Inspiration', 'Bonus Proficiencies', 'Cutting Words', 'Additional Magical Secrets',
  'Peerless Skill',
  // Cleric, Life Domain
  'Channel Divinity', 'Turn Undead', 'Destroy Undead', 'Divine Intervention', 'Bonus Proficiency', 'Disciple of Life',
  'Preserve Life', 'Blessed Healer', 'Divine Strike', 'Supreme Healing',
  // Druid, Circle of the Land
  'Druidic', 'Wild Shape', 'Timeless Body', 'Beast Spells', 'Archdruid', 'Bonus Cantrip', 'Natural Recovery',
  'Circle Spells', "Land's Stride", "Nature's Ward", "Nature's Sanctuary",
  // Fighter, Champion
  'Fighting Style', 'Second Wind', 'Action Surge', 'Indomitable', 'Improved Critical', 'Remarkable Athlete',
  'Additional Fighting Style', 'Superior Critical', 'Survivor',
  // Monk, Way of the Open Hand
  'Martial Arts', 'Ki', 'Unarmored Movement', 'Deflect Missiles', 'Slow Fall', 'Stunning Strike', 'Ki-Empowered Strikes',
  'Evasion', 'Stillness of Mind', 'Purity of Body', 'Tongue of the Sun and Moon', 'Diamond Soul', 'Empty Body',
  'Perfect Self', 'Open Hand Technique', 'Wholeness of Body', 'Tranquility', 'Quivering Palm',
  // Paladin, Oath of Devotion
  'Divine Sense', 'Lay on Hands', 'Divine Smite', 'Divine Health', 'Aura of Protection', 'Aura of Courage',
  'Improved Divine Smite', 'Cleansing Touch', 'Sacred Weapon', 'Turn the Unholy', 'Aura of Devotion',
  'Purity of Spirit', 'Holy Nimbus',
  // Ranger, Hunter
  'Favored Enemy', 'Natural Explorer', 'Primeval Awareness', 'Hide in Plain Sight', 'Vanish', 'Feral Senses',
  'Foe Slayer', "Hunter's Prey", 'Defensive Tactics', 'Multiattack', "Superior Hunter's Defense",
  // Rogue, Thief
  'Sneak Attack', "Thieves' Cant", 'Cunning Action', 'Uncanny Dodge', 'Reliable Talent', 'Blindsense',
  'Slippery Mind', 'Elusive', 'Stroke of Luck', 'Fast Hands', 'Second-Story Work', 'Supreme Sneak',
  'Use Magic Device', "Thief's Reflexes",
  // Sorcerer, Draconic Bloodline
  'Font of Magic', 'Metamagic', 'Sorcerous Restoration', 'Dragon Ancestor', 'Draconic Resilience',
  'Elemental Affinity', 'Dragon Wings', 'Draconic Presence',
  // Warlock, the Fiend, invocations
  'Eldritch Invocations', 'Pact Boon', 'Mystic Arcanum', 'Eldritch Master', "Dark One's Blessing",
  "Dark One's Own Luck", 'Fiendish Resilience', 'Hurl Through Hell', 'Agonizing Blast', 'Armor of Shadows',
  'Ascendant Step', 'Beast Speech', 'Beguiling Influence', 'Bewitching Whispers', 'Book of Ancient Secrets',
  'Chains of Carceri', "Devil's Sight", 'Dreadful Word', 'Eldritch Sight', 'Eldritch Spear', 'Eyes of the Rune Keeper',
  'Fiendish Vigor', 'Gaze of Two Minds', 'Lifedrinker', 'Mask of Many Faces', 'Master of Myriad Forms',
  'Minions of Chaos', 'Mire the Mind', 'Misty Visions', 'One with Shadows', 'Otherworldly Leap', 'Repelling Blast',
  'Sculptor of Flesh', 'Sign of Ill Omen', 'Thief of Five Fates', 'Thirsting Blade', 'Visions of Distant Realms',
  'Voice of the Chain Master', 'Whispers of the Grave', 'Witch Sight',
  // Wizard, School of Evocation
  'Arcane Recovery', 'Spell Mastery', 'Signature Spells', 'Evocation Savant', 'Sculpt Spells', 'Potent Cantrip',
  'Empowered Evocation', 'Overchannel',
  // Races
  'Darkvision', 'Dwarven Resilience', 'Dwarven Combat Training', 'Stonecunning', 'Dwarven Toughness', 'Keen Senses',
  'Fey Ancestry', 'Trance', 'Elf Weapon Training', 'Lucky', 'Brave', 'Halfling Nimbleness', 'Naturally Stealthy',
  'Draconic Ancestry', 'Breath Weapon', 'Gnome Cunning', "Artificer's Lore", 'Tinker', 'Skill Versatility',
  'Menacing', 'Relentless Endurance', 'Savage Attacks', 'Hellish Resistance', 'Infernal Legacy',
  // Background, feat
  'Shelter of the Faithful', 'Grappler',
]);

const PHB_2014 = new Set(["PHB'14", 'PHB', 'SRD 5.1']);

const baseName = (name) => name.replace(/^[^:]+:\s*/, '').replace(/\s*\(.*\)$/, '');

export function isSrdFeature(item) {
  const { book = '', rules = '' } = item.system.source ?? {};
  return SRD_FEATURES.has(baseName(item.name)) && PHB_2014.has(book) && rules !== '2024';
}

const ENTITIES = { amp: '&', nbsp: ' ', quot: '"', lt: '<', gt: '>', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', mdash: '—', ndash: '–', hellip: '…' };

/** Foundry HTML with its enrichers ([[/damage 1d6]], &Reference[…], @UUID[…]{…}) to plain paragraphs. */
export function plainText(html = '') {
  return html
    .replace(/&(#?\w+);/g, (m, e) => (e.startsWith('#') ? String.fromCharCode(Number(e.slice(1))) : ENTITIES[e] ?? m))
    .replace(/\[\[\/\w+\s+([^\]\s]+)[^\]]*\]\]/g, '$1')
    .replace(/&Reference\[(?:\w+=)?([^\]\s]+)[^\]]*\]/g, '$1')
    .replace(/@\w+\[[^\]]*\]\{([^}]*)\}/g, '$1')
    .replace(/@\w+\[([^\]|]*)(?:\|[^\]]*)?\]/g, (_, ref) => ref.split('.').pop())
    .replace(/<\/(p|li|h\d|div)>|<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n');
}
