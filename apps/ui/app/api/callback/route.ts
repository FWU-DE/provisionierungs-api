import * as client from 'openid-client';
import { serialize } from 'cookie';
import type { NextRequest } from 'next/server';

import { getClientConfiguration, getState } from '../../lib/auth';
import { encrypt } from '../../lib/session';

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

  const cookieData = await encrypt({ userId: claims.sub, accessToken: token.access_token });
  const cookie = serialize('session', cookieData, {
    httpOnly: true,
    maxAge: token.expiresIn(),
    path: '/',
  });

  const redirectUrl = new URL(request.url);
  redirectUrl.pathname = '/home';
  redirectUrl.search = '';
  return new Response(null, {
    status: 302,
    headers: { 'Location': redirectUrl.toString(), 'Set-Cookie': cookie },
  });
}
