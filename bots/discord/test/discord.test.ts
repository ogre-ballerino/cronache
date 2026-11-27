import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { describe, it } from 'node:test';
import { verifyDiscord } from '../src/discord.ts';

describe('verifyDiscord', () => {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const hex = publicKey.export({ format: 'der', type: 'spki' }).subarray(-32).toString('hex');
  const body = '{"type":1}';
  const firma = (ts: string, b: string) => sign(null, Buffer.from(ts + b), privateKey).toString('hex');

  it('accepts a request signed by the application', async () => {
    assert.ok(await verifyDiscord(firma('1700000000', body), '1700000000', body, hex));
  });

  it('rejects another body, another timestamp or missing headers', async () => {
    assert.equal(await verifyDiscord(firma('1700000000', body), '1700000000', '{"type":2}', hex), false);
    assert.equal(await verifyDiscord(firma('1700000000', body), '1700000001', body, hex), false);
    assert.equal(await verifyDiscord(null, '1700000000', body, hex), false);
    assert.equal(await verifyDiscord('zz', '1700000000', body, hex), false);
  });
});
