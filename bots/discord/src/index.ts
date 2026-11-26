import { verifyNetlify } from './netlify.ts';

export { Campagna } from './campagna.ts';

type Secrets = { NETLIFY_JWS_SECRET: string } & Record<`DISCORD_WEBHOOK_${string}`, string | undefined>;

const campagna = (env: Env, nome: string) => env.CAMPAGNA.get(env.CAMPAGNA.idFromName(nome));

// POST /netlify/<campagna>: Netlify's "deploy succeeded" notification for that site.
async function onDeploy(request: Request, env: Env & Secrets, nome: string) {
  const site = (env.CAMPAGNE as Record<string, string>)[nome];
  const webhook = env[`DISCORD_WEBHOOK_${nome.toUpperCase()}`];
  if (!site || !webhook) return new Response('Unknown campaign', { status: 404 });

  const body = await request.text();
  if (!(await verifyNetlify(request.headers.get('X-Webhook-Signature'), body, env.NETLIFY_JWS_SECRET))) {
    return new Response('Bad signature', { status: 401 });
  }
  if (JSON.parse(body).context !== 'production') return new Response('Not production');
  return new Response(await campagna(env, nome).announce(site, webhook));
}

export default {
  async fetch(request, env) {
    const [, route, nome] = new URL(request.url).pathname.split('/');
    if (request.method === 'POST' && route === 'netlify' && nome) return onDeploy(request, env as Env & Secrets, nome);
    return new Response('Not found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
