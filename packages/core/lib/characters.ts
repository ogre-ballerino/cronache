import config from 'virtual:cronache/config';

// The site's own descriptive fields (classe, professione…), then the player.
export function characterMeta(data: Record<string, unknown>): string {
  return [
    ...config.sections.personaggi.metaFields.map((field) => data[field]),
    data.giocatore && `Giocatore: ${data.giocatore}`,
  ]
    .filter(Boolean)
    .join(' · ');
}
