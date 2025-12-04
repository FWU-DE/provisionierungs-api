import * as client from 'openid-client';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

import { getClientConfiguration, getState } from '../../lib/auth';
import { getConfig } from '../../lib/config';
import { encryptSession } from '../../lib/session';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  url.protocol = 'https:';
  url.port = '';
  const state = await getState(request.cookies.get('state')?.value);
  if (!state.state || !state.codeVerifier) {
    return new Response('Invalid state or code verifier', { status: 400 });
  }

  const token = await client.authorizationCodeGrant(await getClientConfiguration(), url, {
    expectedState: state.state,
    pkceCodeVerifier: state.codeVerifier,
  });

  const claims = token.claims();
  if (!claims) {
    return new Response('No claims found', { status: 400 });
  }

  const cookieData = await encryptSession({ userId: claims.sub, accessToken: token.access_token });
  (await cookies()).set(getConfig().sessionCookieName, cookieData, {
    httpOnly: true,
    secure: true,
    maxAge: token.expiresIn(),
    path: '/',
  });

  return NextResponse.redirect(`${getConfig().selfBaseUrl}/home`, { status: 302 });
}
