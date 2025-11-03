import { type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import 'server-only';

import { decrypt, encrypt as encryptAuth } from './auth';

interface SessionPayload extends JWTPayload {
  userId: string;
  accessToken: string;
}

// TODO: This is all test code and needs to be replaced with proper user session management
export async function encrypt(payload: SessionPayload) {
  return encryptAuth(payload);
}

export async function updateSession() {
  const session = (await cookies()).get('session')?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export const verifySession = cache(
  async (): Promise<{ isAuth: boolean; userId: string; accessToken: string }> => {
    const session = await getSession();

    if (!session?.userId) {
      redirect('/login');
    }

    return {
      isAuth: true,
      userId: session.userId as string,
      accessToken: session.accessToken as string,
    };
  },
);

export const getSession = cache(async () => {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  return session ?? null;
});
