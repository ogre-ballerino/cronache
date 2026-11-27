import type { Bot } from './bot.ts';

// The trailing slash is a URL format detail, not a new session.
export const sameSession = (a: string | undefined, b: string) => a?.replace(/\/$/, '') === b.replace(/\/$/, '');

export function announcement({ announcement, readMore, color, latest }: Bot & { latest: NonNullable<Bot['latest']> }) {
  return {
    content: announcement,
    embeds: [
      {
        title: latest.title,
        url: latest.url,
        description: `${latest.excerpt}\n\n[${readMore}](${latest.url})`.trim(),
        color,
        image: { url: latest.image },
        footer: { text: `${latest.label} · ${latest.date}` },
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
