const lost = ['morto', 'morta', 'scomparso', 'scomparsa'];

export const isLost = (stato?: string) => lost.includes(stato ?? '');
