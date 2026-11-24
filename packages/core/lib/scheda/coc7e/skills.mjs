// The skills printed on Chaosium's "1920s Era Investigator" sheet, with their
// base values and the names of the fillable PDF's fields (Skill_<key>,
// Skill_<key>_half, Skill_<key>_fifth, Skill_<key>_Chk, SkillDef_<key>).

export const CHARACTERISTICS = { str: 'STR', con: 'CON', siz: 'SIZ', dex: 'DEX', app: 'APP', int: 'INT', pow: 'POW', edu: 'EDU' };

/** [name, base, field key]; a base of 'dex' or 'edu' depends on the investigator. */
export const SKILLS = [
  ['Accounting', 5, 'Accounting'],
  ['Anthropology', 1, 'Anthropology'],
  ['Appraise', 5, 'Appraise'],
  ['Archaeology', 1, 'Archaeology'],
  ['Charm', 15, 'Charm'],
  ['Climb', 20, 'Climb'],
  ['Credit Rating', 0, 'Credit'],
  ['Cthulhu Mythos', 0, 'Cthulhu'],
  ['Disguise', 5, 'Disguise'],
  ['Dodge', 'dex', 'Dodge'],
  ['Drive Auto', 20, 'Drive'],
  ['Elec. Repair', 10, 'ElecRepair'],
  ['Fast Talk', 5, 'FastTalk'],
  ['Fighting (Brawl)', 25, 'Fighting'],
  ['Firearms (Handgun)', 20, 'FireArmsHandguns'],
  ['Firearms (Rifle/Shotgun)', 25, 'FireArmsRifles'],
  ['First Aid', 30, 'FirstAid'],
  ['History', 5, 'History'],
  ['Intimidate', 15, 'Intimidate'],
  ['Jump', 20, 'Jump'],
  ['Law', 5, 'Law'],
  ['Library Use', 20, 'LibraryUse'],
  ['Listen', 20, 'Listen'],
  ['Locksmith', 1, 'Locksmith'],
  ['Mech. Repair', 10, 'MechRepair'],
  ['Medicine', 1, 'Medicine'],
  ['Natural World', 10, 'NaturalWorld'],
  ['Navigate', 10, 'Navigate'],
  ['Occult', 5, 'Occult'],
  ['Persuade', 10, 'Persuade'],
  ['Psychoanalysis', 1, 'Psychoanalysis'],
  ['Psychology', 10, 'Psychology'],
  ['Ride', 5, 'Ride'],
  ['Sleight of Hand', 10, 'Sleight'],
  ['Spot Hidden', 25, 'SpotHidden'],
  ['Stealth', 20, 'Stealth'],
  ['Swim', 20, 'Swim'],
  ['Throw', 20, 'Throw'],
  ['Track', 10, 'Track'],
];

/** Skills with a specialty written on the sheet: category → [base, field keys of its lines]. */
export const SPECIALTIES = {
  'Art/Craft': [5, ['ArtCraft1', 'ArtCraft2']],
  Fighting: [null, ['Fighting1', 'Fighting2']],
  Firearms: [null, ['Firearms']],
  'Language (Other)': [1, ['OtherLanguage', 'OtherLanguage1', 'OtherLanguage2']],
  'Language (Own)': ['edu', ['OwnLanguage']],
  Pilot: [1, ['Pilot']],
  Science: [1, ['Science1', 'Science2', 'Science3']],
  Survival: [10, ['Survival']],
};

/** Blank lines at the bottom of the skill list, for anything else. */
export const CUSTOM_SLOTS = ['Custom1', 'Custom2', 'Custom3', 'Custom4'];

export const STATES = {
  folliaTemporanea: ['Temporary Insanity', 'TempInsanity_Chk'],
  folliaIndefinita: ['Indefinite Insanity', 'IndefInsanity_Chk'],
  feritaGrave: ['Major Wound', 'MajorWound_Chk'],
  privoDiSensi: ['Unconscious', 'Unconscious_Chk'],
  morente: ['Dying', 'Dying_Chk'],
};

/** A skill's starting value for this investigator, or undefined when it has none. */
export function baseValue(base, characteristics) {
  if (base === 'dex') return Math.floor(characteristics.dex / 2);
  if (base === 'edu') return characteristics.edu;
  return base ?? undefined;
}

export const skillLabel = (skill) => (skill.specialita ? `${skill.nome}: ${skill.specialita}` : skill.nome);

export const half = (n) => Math.floor(n / 2);
export const fifth = (n) => Math.floor(n / 5);
