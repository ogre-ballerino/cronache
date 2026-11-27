import { postToDiscord } from './announcement.ts';
import { deleteEvent, saveEvent, type ICloud } from './calendar.ts';
import { formatTime, parseDate, parseTime, suggestDates, suggestTimes, toInstant } from './dates.ts';
import {
  button,
  choices,
  defer,
  deferUpdate,
  editOriginal,
  ephemeral,
  fullAndRelativeTime,
  fullTime,
  INTERACTION,
  option,
  pong,
  verifyDiscord,
  type Interaction,
} from './discord.ts';
import { byChannel, campaign, icloud, webhook, type CampaignSettings, type Secrets } from './settings.ts';

const CANCEL = /^cancel:/;

interface Context {
  env: Env & Secrets;
  name: string;
  settings: CampaignSettings;
  feed: string;
}

// POST /discord: Ogre Tamburino's interactions endpoint. What players read stays in Italian.
export async function onInteraction(request: Request, env: Env & Secrets, ctx: ExecutionContext) {
  const body = await request.text();
  const ok = await verifyDiscord(
    request.headers.get('X-Signature-Ed25519'),
    request.headers.get('X-Signature-Timestamp'),
    body,
    env.DISCORD_PUBLIC_KEY,
  );
  if (!ok) return new Response('Bad signature', { status: 401 });

  const i: Interaction = JSON.parse(body);
  if (i.type === INTERACTION.ping) return pong();
  const found = byChannel(i.channel_id);
  if (!found) return ephemeral('Funziono solo nei canali delle campagne.');
  const [name, settings] = found;
  const context = { env, name, settings, feed: new URL(`/calendar/${name}.ics`, request.url).href };

  if (i.type === INTERACTION.autocomplete) return suggest(i, context);
  if (i.type === INTERACTION.command) return schedule(i, context, ctx);
  if (i.type === INTERACTION.button && CANCEL.test(i.data?.custom_id ?? '')) return cancel(i, context, ctx);
  return new Response('Unknown interaction', { status: 400 });
}

async function suggest(i: Interaction, { env, name, settings }: Context) {
  const focused = i.data?.options?.find((o) => o.focused);
  if (focused?.name === 'date') return choices(suggestDates(Date.now(), settings.timezone, focused.value));
  return choices(suggestTimes(await campaign(env, name).lastTime(), focused?.value));
}

function schedule(i: Interaction, { env, name, settings, feed }: Context, ctx: ExecutionContext) {
  const dateText = option(i, 'date')?.value ?? '';
  const timeText = option(i, 'time')?.value ?? '';
  const day = parseDate(dateText, Date.now(), settings.timezone);
  if (!day) return ephemeral(`Non capisco la data «${dateText}»: sceglila dall'elenco o scrivila come 28/11.`);
  const time = parseTime(timeText);
  if (!time) return ephemeral(`Non capisco l'ora «${timeText}»: scrivila come 16:30.`);
  const start = toInstant(day, time, settings.timezone);
  if (start <= Date.now()) return ephemeral(`${fullTime(start)} è già passato.`);

  const session = { uid: `${name}-${start}`, start };
  ctx.waitUntil(
    respond(env, i.token, async () => {
      const replaced = await campaign(env, name).schedule(session, formatTime(time));
      await postToDiscord(webhook(env, name)!, {
        content: `Prossima sessione: ${fullAndRelativeTime(start)}\n[Aggiungi al calendario](<${feed}>)\n${settings.signature}`,
      });
      const warning = await withICloud(env, name, async (calendar) => {
        await saveEvent(calendar, session, settings.event);
        for (const s of replaced) await deleteEvent(calendar, s.uid);
      });
      return { content: `Segnato: ${fullAndRelativeTime(start)} ✓${warning}`, components: button('Annulla', `cancel:${session.uid}`) };
    }),
  );
  return defer();
}

function cancel(i: Interaction, { env, name, settings }: Context, ctx: ExecutionContext) {
  const uid = i.data?.custom_id?.replace(CANCEL, '') ?? '';
  ctx.waitUntil(
    respond(env, i.token, async () => {
      const session = await campaign(env, name).cancel(uid);
      if (!session) return { content: 'Questa sessione è già passata o è stata annullata.', components: [] };
      await postToDiscord(webhook(env, name)!, { content: `La sessione di ${fullTime(session.start)} è annullata.\n${settings.signature}` });
      const warning = await withICloud(env, name, (calendar) => deleteEvent(calendar, uid));
      return { content: `Annullata: ${fullTime(session.start)}.${warning}`, components: [] };
    }),
  );
  return deferUpdate();
}

// The personal calendar comes last and never blocks the group: a failure only shows in the private reply.
async function withICloud(env: Env & Secrets, name: string, work: (calendar: ICloud) => Promise<void>) {
  const calendar = icloud(env, name);
  if (!calendar) return '';
  try {
    await work(calendar);
    return '';
  } catch (error) {
    console.error(error);
    return `\n⚠️ Calendario iCloud non aggiornato: ${(error as Error).message.slice(0, 200)}`;
  }
}

// Replaces the "thinking…" reply with the outcome, or with the error, so nothing fails silently.
async function respond(env: Env, token: string, work: () => Promise<{ content: string; components?: object[] }>) {
  let message;
  try {
    message = await work();
  } catch (error) {
    console.error(error);
    message = { content: `Qualcosa è andato storto: ${(error as Error).message.slice(0, 300)}` };
  }
  await editOriginal(env.DISCORD_APP_ID, token, message);
}
