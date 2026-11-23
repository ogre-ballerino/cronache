import type { CollectionEntry } from 'astro:content';

type Session = CollectionEntry<'sessions'>;

// Newest first. A campaign without seasons comes back as a single group with
// `stagione` undefined, so callers can skip the season headings.
export function groupBySeason(sessions: Session[]): { stagione?: number; sessions: Session[] }[] {
  const seasons = new Map<number | undefined, Session[]>();
  for (const s of [...sessions].sort((a, b) => b.data.numero - a.data.numero)) {
    seasons.set(s.data.stagione, [...(seasons.get(s.data.stagione) ?? []), s]);
  }
  return [...seasons]
    .sort(([a], [b]) => (b ?? 0) - (a ?? 0))
    .map(([stagione, sessions]) => ({ stagione, sessions }));
}
