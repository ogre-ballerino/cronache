// Netlify signs outgoing webhooks with a JWS (HS256) in X-Webhook-Signature whose
// payload carries the SHA-256 of the body.
const encoder = new TextEncoder();

const base64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

const hex = (buffer: ArrayBuffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function verifyNetlify(signature: string | null, body: string, secret: string): Promise<boolean> {
  const [header, payload, sig] = signature?.split('.') ?? [];
  if (!header || !payload || !sig) return false;
  try {
    if (JSON.parse(new TextDecoder().decode(base64url(header))).alg !== 'HS256') return false;
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    if (!(await crypto.subtle.verify('HMAC', key, base64url(sig), encoder.encode(`${header}.${payload}`)))) return false;
    const claims = JSON.parse(new TextDecoder().decode(base64url(payload)));
    return claims.iss === 'netlify' && claims.sha256 === hex(await crypto.subtle.digest('SHA-256', encoder.encode(body)));
  } catch {
    return false;
  }
}
