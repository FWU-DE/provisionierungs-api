import { getConfig } from '@/lib/config';
import type { User } from '@/lib/model/user';
import { verifySession } from '@/lib/session';
import { isStringArray } from '@/lib/utils';
import { decodeJwt } from 'jose';
import { cookies } from 'next/headers';

import { AccessTokenMissingException } from './access-token-missing-exception';
import { InvalidTokenPayloadException } from './invalid-token-payload-exception';
import { SessionNotFoundException } from './session-not-found-exception';
import { TokenVerificationException } from './token-verification-exception';

export async function getUserFromSession(): Promise<User> {
  const session = await verifySession();
  if (!session) {
    throw new SessionNotFoundException();
  }

  if (!session.accessToken) {
    throw new AccessTokenMissingException();
  }

  try {
    const context = decodeJwt(session.accessToken);
    if (typeof context.heimatorganisation !== 'string' || !isStringArray(context.schulkennung)) {
      throw new InvalidTokenPayloadException();
    }

    return {
      userId: session.userId,
      heimatorganisation: context.heimatorganisation,
      schulkennung: context.schulkennung,
      selectedSchool: await getUserSchoolSelection(),
    };
  } catch (error) {
    if (
      error instanceof SessionNotFoundException ||
      error instanceof AccessTokenMissingException ||
      error instanceof InvalidTokenPayloadException
    ) {
      throw error;
    }
    throw new TokenVerificationException(error);
  }
}

export async function getUserSchoolSelection() {
  return (await cookies()).get(getConfig().schoolSelectionCookieName)?.value;
}

export async function clearUserSchoolSelection() {
  (await cookies()).delete(getConfig().schoolSelectionCookieName);
}

export async function setUserSchoolSelection(schulkennung: string) {
  (await cookies()).set(getConfig().schoolSelectionCookieName, schulkennung, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}
