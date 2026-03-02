import { type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { cache } from 'react';
import 'server-only';

import { decrypt, encrypt } from './auth';
import { getConfig } from './config';

interface SessionPayload extends JWTPayload {
  userId: string;
  accessToken: string;
}

export interface VerifiedSession extends SessionPayload {
  isAuth: boolean;
}

export async function encryptSession(payload: SessionPayload) {
  return encrypt(payload);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(getConfig().sessionCookieName);
}

export const verifySession = cache(async (): Promise<VerifiedSession | undefined> => {
  const session = await getSession();

  if (!session?.userId) {
    return undefined;
  }

  return {
    isAuth: true,
    userId: session.userId as string,
    accessToken: session.accessToken as string,
  };
});

export const getSession = cache(async () => {
  const cookie = (await cookies()).get(getConfig().sessionCookieName)?.value;
  const session = await decrypt(cookie);
  return session ?? null;
});
