import * as client from 'openid-client';
import { type JWTPayload, SignJWT, jwtVerify } from 'jose';

import { getConfig } from './config';

export async function getClientConfiguration() {
  const { clientId, clientSecret, authUrl: url } = getConfig();
  return await client.discovery(new URL(url), clientId, clientSecret);
}

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(jwt: string | undefined = '') {
  if (!jwt) {
    return undefined;
  }

  try {
    const { payload } = await jwtVerify(jwt, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Failed to verify session', error);
  }
}

export async function encryptState(state: string, codeVerifier: string) {
  return await encrypt({ state, codeVerifier });
}

export async function getState(
  state: string | undefined,
): Promise<{ state?: string; codeVerifier?: string }> {
  const result = await decrypt(state);

  return {
    state: result?.state as string | undefined,
    codeVerifier: result?.codeVerifier as string | undefined,
  };
}
