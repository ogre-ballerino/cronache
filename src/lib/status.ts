const lost = ['morto', 'morta', 'scomparso', 'scomparsa', 'ritirato', 'ritirata'];

export const isLost = (stato?: string) => lost.includes(stato ?? '');
