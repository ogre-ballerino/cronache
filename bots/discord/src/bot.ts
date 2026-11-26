// The shape of a site's /bot.json (packages/core/pages/bot.json.ts).
export interface Bot {
  annuncio: string;
  leggi: string;
  colore: number;
  ultima?: {
    url: string;
    titolo: string;
    etichetta: string;
    data: string;
    estratto: string;
    immagine: string;
  };
}

export async function readBot(site: string): Promise<Bot> {
  const res = await fetch(new URL('/bot.json', site), { cache: 'no-store' });
  if (!res.ok) throw new Error(`${site}/bot.json: HTTP ${res.status}`);
  return res.json();
}
