// Italian status values, with feminine forms for female characters.
const ALIVE = ['vivo', 'viva'];
const DEAD = ['morto', 'morta'];
const LOST = [...DEAD, 'scomparso', 'scomparsa', 'ritirato', 'ritirata'];
const UNCERTAIN = ['scomparso', 'scomparsa', 'sconosciuto'];

export const STATI_PERSONAGGI = [...ALIVE, ...DEAD, 'folle', 'scomparso', 'scomparsa', 'ritirato', 'ritirata'];
export const STATI_PNG = [...ALIVE, ...DEAD, 'folle', 'scomparso', 'scomparsa', 'sconosciuto'];

export const isAlive = (stato) => ALIVE.includes(stato ?? '');
export const isDead = (stato) => DEAD.includes(stato ?? '');
// No longer part of the party: dims portraits.
export const isLost = (stato) => LOST.includes(stato ?? '');
// Worth a note next to an NPC's role in the session margins.
export const isUncertain = (stato) => UNCERTAIN.includes(stato ?? '');
