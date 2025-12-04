import * as client from 'openid-client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { encryptState, getClientConfiguration } from '../../lib/auth';
import { getConfig } from '../../lib/config';

export async function GET() {
  const config = getConfig();
  const clientConfig = await getClientConfiguration();

  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();

  (await cookies()).set('state', await encryptState(state, codeVerifier), {
    httpOnly: true,
    secure: true,
    maxAge: 10 * 60, // 10 minutes
    path: '/',
  });

  return NextResponse.redirect(
    client.buildAuthorizationUrl(clientConfig, {
      redirect_uri: `${config.selfBaseUrl}/api/callback`,
      scope: config.scopes,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state,
    }),
    { status: 302 },
  );
}
