// The shape of a site's /bot.json (packages/core/pages/bot.json.ts).
export interface Bot {
  announcement: string;
  readMore: string;
  color: number;
  latest?: {
    url: string;
    title: string;
    label: string;
    date: string;
    excerpt: string;
    image: string;
  };
  sessions?: { date: string; title: string; url: string }[];
}

export async function readBot(site: string): Promise<Bot> {
  const res = await fetch(new URL('/bot.json', site), { cache: 'no-store' });
  if (!res.ok) throw new Error(`${site}/bot.json: HTTP ${res.status}`);
  return res.json();
}
