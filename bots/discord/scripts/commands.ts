// Registers Ogre Tamburino's slash command, replacing any registered before. Run after changing COMMAND: `pnpm commands`.
import { COMMAND } from '../src/discord.ts';

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) throw new Error('DISCORD_BOT_TOKEN missing from .dev.vars');
const headers = { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' };

const app = await fetch('https://discord.com/api/v10/applications/@me', { headers }).then((r) => r.json());
const res = await fetch(`https://discord.com/api/v10/applications/${app.id}/commands`, {
  method: 'PUT',
  headers,
  body: JSON.stringify([COMMAND]),
});
if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
console.log(`Registered /${COMMAND.name} for ${app.name}`);
