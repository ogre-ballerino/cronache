import type { CollectionEntry } from 'astro:content';

type Session = CollectionEntry<'sessions'>;

export function groupBySeason(sessions: Session[]): { stagione: number; sessions: Session[] }[] {
  const seasons = new Map<number, Session[]>();
  for (const s of [...sessions].sort((a, b) => b.data.numero - a.data.numero)) {
    seasons.set(s.data.stagione, [...(seasons.get(s.data.stagione) ?? []), s]);
  }
  return [...seasons]
    .sort(([a], [b]) => b - a)
    .map(([stagione, sessions]) => ({ stagione, sessions }));
}
