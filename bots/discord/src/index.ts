import { readBot } from './bot.ts';
import { ics } from './calendar.ts';
import { feed } from './feed.ts';
import { onInteraction } from './interactions.ts';
import { verifyNetlify } from './netlify.ts';
import { campaign, settings, webhook, type Secrets } from './settings.ts';

export { Campaign } from './campaign.ts';

// POST /netlify/<campaign>: Netlify's "deploy succeeded" notification for that site.
async function onDeploy(request: Request, env: Env & Secrets, name: string) {
  const c = settings(name);
  const hook = webhook(env, name);
  if (!c || !hook) return new Response('Unknown campaign', { status: 404 });

  const body = await request.text();
  if (!(await verifyNetlify(request.headers.get('X-Webhook-Signature'), body, env.NETLIFY_JWS_SECRET))) {
    return new Response('Bad signature', { status: 401 });
  }
  if (JSON.parse(body).context !== 'production') return new Response('Not production');
  return new Response(await campaign(env, name).announce(c.site, hook));
}

// GET /calendar/<campaign>.ics: the campaign's sessions, to subscribe to.
async function onCalendar(env: Env, name: string) {
  const c = settings(name);
  if (!c) return new Response('Unknown campaign', { status: 404 });
  // Without the site, the feed still has the dates set with /next.
  const journal = await readBot(c.site).then((bot) => bot.sessions, () => []);
  const events = feed(name, c.event, c.timezone, await campaign(env, name).sessions(), journal, c.slot);
  return new Response(ics(events, c.title), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `inline; filename="${name}.ics"` },
  });
}

// GET /next/<campaign>.json: the next session, for the site's home page.
async function onNext(env: Env, name: string) {
  if (!settings(name)) return new Response('Unknown campaign', { status: 404 });
  const s = await campaign(env, name).next();
  return Response.json(
    { start: s ? new Date(s.start).toISOString() : null },
    { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'max-age=60' } },
  );
}

export default {
  async fetch(request, env, ctx) {
    const [, route, file] = new URL(request.url).pathname.split('/');
    const e = env as Env & Secrets;
    if (request.method === 'POST' && route === 'netlify' && file) return onDeploy(request, e, file);
    if (request.method === 'POST' && route === 'discord') return onInteraction(request, e, ctx);
    if (request.method === 'GET' && route === 'calendar' && file?.endsWith('.ics')) return onCalendar(env, file.slice(0, -4));
    if (request.method === 'GET' && route === 'next' && file?.endsWith('.json')) return onNext(env, file.slice(0, -5));
    return new Response('Not found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
