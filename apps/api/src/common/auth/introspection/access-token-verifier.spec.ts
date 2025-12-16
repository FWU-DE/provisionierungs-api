import type { GenerateKeyPairResult, JSONWebKeySet, JWTPayload } from 'jose';

import { AccessTokenVerifier } from './access-token-verifier';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
async function getJose(): Promise<typeof import('jose')> {
  return await import('jose');
}

let cryptoKeyPair: GenerateKeyPairResult | null = null;
async function getCryptoKeyPair() {
  return (cryptoKeyPair ??= await (await getJose()).generateKeyPair('RS256'));
}

const getSignedJWTToken = async (
  payload: JWTPayload,
  keyStore: GenerateKeyPairResult,
): Promise<string> => {
  return await new (await getJose()).SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(keyStore.privateKey);
};

const validAccessToken = {
  iss: 'https://example.test',
  iat: Math.floor(Date.now() / 1000),
  jti: 'test-jti',
  sid: 'test-sid',
  exp: Math.floor(Date.now() / 1000) + 300,
  sub: '628ca3e7-16e3-45f1-837f-daec7c52d4f6',
  typ: 'Bearer',
};

describe('AccessTokenVerifier', () => {
  it('signature validation for wrong key should fail', async () => {
    const keyStore = await getCryptoKeyPair();
    const accessToken = await getSignedJWTToken({}, keyStore);

    const otherKeyStore = await (await getJose()).generateKeyPair('RS256');
    const otherLocalJWKSet = {
      keys: [await (await getJose()).exportJWK(otherKeyStore.publicKey)],
    } satisfies JSONWebKeySet;

    const tokenVerifier = new AccessTokenVerifier(
      (await getJose()).createLocalJWKSet(otherLocalJWKSet),
      {
        id_token_signing_alg_values_supported: ['RS256'],
        issuer: 'https://example.test',
      },
    );

    await expect(tokenVerifier.verifyAccessToken(accessToken)).rejects.toThrow(
      'signature verification failed',
    );
  });

  it.each([
    ['no claims', {}],
    [
      'wrong issuer',
      {
        ...validAccessToken,
        iss: 'https://example.test/wrong',
      },
    ],
    [
      'expired',
      {
        ...validAccessToken,
        exp: 100,
      },
    ],
    [
      'wrong typ',
      {
        ...validAccessToken,
        typ: 'InvalidTyp',
      },
    ],
    [
      'wrong type for heimatorganisation',
      {
        ...validAccessToken,
        heimatorganisation: 12345,
      },
    ],
    [
      'wrong type for schulkennung (not an array)',
      {
        ...validAccessToken,
        schulkennung: 'not-an-array',
      },
    ],
    [
      'wrong type for schulkennung (not an array of strnigs)',
      {
        ...validAccessToken,
        schulkennung: [1, 2, 3],
      },
    ],
  ])('token validation should fail for malformed tokens: %s', async (_, claims) => {
    const keyStore = await getCryptoKeyPair();
    const accessToken = await getSignedJWTToken(claims, keyStore);

    const tokenVerifier = new AccessTokenVerifier(
      (await getJose()).createLocalJWKSet({
        keys: [await (await getJose()).exportJWK(keyStore.publicKey)],
      }),
      {
        id_token_signing_alg_values_supported: ['RS256'],
        issuer: 'https://example.test',
      },
    );

    await expect(tokenVerifier.verifyAccessToken(accessToken)).rejects.toThrow();
  });

  it('token validation should succeed', async () => {
    const keyStore = await getCryptoKeyPair();
    const accessToken = await getSignedJWTToken(validAccessToken, keyStore);

    const tokenVerifier = new AccessTokenVerifier(
      (await getJose()).createLocalJWKSet({
        keys: [await (await getJose()).exportJWK(keyStore.publicKey)],
      }),
      {
        id_token_signing_alg_values_supported: ['RS256'],
        issuer: 'https://example.test',
      },
    );

    expect(await tokenVerifier.verifyAccessToken(accessToken)).toEqual(validAccessToken);
  });
  it('token validation with all optional claims should succeed', async () => {
    const keyStore = await getCryptoKeyPair();
    const accessToken = await getSignedJWTToken(
      {
        ...validAccessToken,
        sid: '7240fe23-285c-4bf6-a71d-e242c7edb10c',
        scope: 'openid role',
        client_id: '26e439bc-0028-4f70-b2df-e3a6db849a68',
        schulkennung: ['schulkennung1', 'schulkennung2'],
        heimatorganisation: 'heimatorganisation1',
        email: 'foo@example.test',
      },
      keyStore,
    );

    const tokenVerifier = new AccessTokenVerifier(
      (await getJose()).createLocalJWKSet({
        keys: [await (await getJose()).exportJWK(keyStore.publicKey)],
      }),
      {
        id_token_signing_alg_values_supported: ['RS256'],
        issuer: 'https://example.test',
      },
    );

    expect(await tokenVerifier.verifyAccessToken(accessToken)).toEqual({
      ...validAccessToken,
      sid: '7240fe23-285c-4bf6-a71d-e242c7edb10c',
      scope: 'openid role',
      client_id: '26e439bc-0028-4f70-b2df-e3a6db849a68',
      schulkennung: ['schulkennung1', 'schulkennung2'],
      heimatorganisation: 'heimatorganisation1',
      email: 'foo@example.test',
    });
  });
});
