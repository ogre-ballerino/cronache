import type { Bot } from './bot.ts';

// The trailing slash is a URL format detail, not a new session.
export const sameSession = (a: string | undefined, b: string) => a?.replace(/\/$/, '') === b.replace(/\/$/, '');

export function announcement({ annuncio, leggi, colore, ultima }: Bot & { ultima: NonNullable<Bot['ultima']> }) {
  return {
    content: annuncio,
    embeds: [
      {
        title: ultima.titolo,
        url: ultima.url,
        description: `${ultima.estratto}\n\n[${leggi}](${ultima.url})`.trim(),
        color: colore,
        image: { url: ultima.immagine },
        footer: { text: `${ultima.etichetta} · ${ultima.data}` },
      },
    ],
  };
}

export async function postToDiscord(webhook: string, message: object) {
  const res = await fetch(`${webhook}?wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error(`Discord webhook: HTTP ${res.status} ${await res.text()}`);
}
