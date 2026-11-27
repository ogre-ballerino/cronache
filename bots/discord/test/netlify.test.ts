import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { describe, it } from 'node:test';
import { verifyNetlify } from '../src/netlify.ts';

const b64 = (s: string | Buffer) => Buffer.from(s).toString('base64url');

function sign(body: string, secret: string, claims: object = { iss: 'netlify', sha256: createHash('sha256').update(body).digest('hex') }) {
  const unsigned = `${b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64(JSON.stringify(claims))}`;
  return `${unsigned}.${b64(createHmac('sha256', secret).update(unsigned).digest())}`;
}

describe('verifyNetlify', () => {
  const body = '{"context":"production"}';

  it('accepts a signature made with the secret over this body', async () => {
    assert.ok(await verifyNetlify(sign(body, 's3cret'), body, 's3cret'));
  });

  it('rejects another secret, another body, a missing header or a foreign issuer', async () => {
    assert.ok(!(await verifyNetlify(sign(body, 'other'), body, 's3cret')));
    assert.ok(!(await verifyNetlify(sign(body, 's3cret'), '{"context":"deploy-preview"}', 's3cret')));
    assert.ok(!(await verifyNetlify(null, body, 's3cret')));
    assert.ok(!(await verifyNetlify('garbage', body, 's3cret')));
    const sha256 = createHash('sha256').update(body).digest('hex');
    assert.ok(!(await verifyNetlify(sign(body, 's3cret', { iss: 'someone', sha256 }), body, 's3cret')));
  });
});
