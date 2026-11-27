// Discord interactions (slash commands, autocomplete, buttons) for Ogre Tamburino.
const API = 'https://discord.com/api/v10';
const EPHEMERAL = 64;
const MANAGE_EVENTS = 1n << 33n;

export const INTERACTION = { ping: 1, command: 2, button: 3, autocomplete: 4 } as const;

export interface Interaction {
  type: (typeof INTERACTION)[keyof typeof INTERACTION];
  token: string;
  channel_id?: string;
  data?: {
    name?: string;
    custom_id?: string;
    options?: { name: string; value: string; focused?: boolean }[];
  };
}

// Registered by scripts/commands.ts. Named in English, shown in Italian to Discord clients set to Italian
// (`/prossima data ora`); interactions always carry the English names. Only members with Manage Events see it;
// the server can grant it to any role under Server Settings → Integrations.
export const COMMAND = {
  name: 'next',
  name_localizations: { it: 'prossima' },
  description: 'Set the date of the next session',
  description_localizations: { it: 'Fissa la data della prossima sessione' },
  type: 1,
  contexts: [0],
  integration_types: [0],
  default_member_permissions: String(MANAGE_EVENTS),
  options: [
    {
      type: 3,
      name: 'date',
      name_localizations: { it: 'data' },
      description: 'The day, e.g. 28/11',
      description_localizations: { it: 'Il giorno, es. 28/11' },
      required: true,
      autocomplete: true,
    },
    {
      type: 3,
      name: 'time',
      name_localizations: { it: 'ora' },
      description: 'The start time, e.g. 16:30',
      description_localizations: { it: "L'ora d'inizio, es. 16:30" },
      required: true,
      autocomplete: true,
    },
  ],
};

const hexBytes = (hex: string) => Uint8Array.from(hex.match(/../g) ?? [], (b) => parseInt(b, 16));

export async function verifyDiscord(signature: string | null, timestamp: string | null, body: string, publicKey: string) {
  if (!signature || !timestamp) return false;
  try {
    const key = await crypto.subtle.importKey('raw', hexBytes(publicKey), { name: 'Ed25519' }, false, ['verify']);
    return await crypto.subtle.verify('Ed25519', key, hexBytes(signature), new TextEncoder().encode(timestamp + body));
  } catch {
    return false;
  }
}

export const option = (i: Interaction, name: string) => i.data?.options?.find((o) => o.name === name);

export const pong = () => Response.json({ type: 1 });
export const choices = (choices: { name: string; value: string }[]) => Response.json({ type: 8, data: { choices } });
export const ephemeral = (content: string) => Response.json({ type: 4, data: { content, flags: EPHEMERAL } });
// "Thinking…" while the work runs; finish with editOriginal.
export const defer = () => Response.json({ type: 5, data: { flags: EPHEMERAL } });
export const deferUpdate = () => Response.json({ type: 6 });

export const button = (label: string, custom_id: string) => [
  { type: 1, components: [{ type: 2, style: 4, label, custom_id }] },
];

export async function editOriginal(appId: string, token: string, message: { content: string; components?: object[] }) {
  const res = await fetch(`${API}/webhooks/${appId}/${token}/messages/@original`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error(`Discord edit: HTTP ${res.status} ${await res.text()}`);
}

// Discord shows these in each reader's own timezone and language: "Saturday, 28 November 2026 16:30 (in 2 days)".
const unix = (ms: number) => Math.floor(ms / 1000);
export const fullTime = (ms: number) => `<t:${unix(ms)}:F>`;
export const fullAndRelativeTime = (ms: number) => `<t:${unix(ms)}:F> (<t:${unix(ms)}:R>)`;
