import * as client from 'openid-client';
import { serialize } from 'cookie';

import { encrypt, getClientConfiguration } from '../../lib/auth';

// TODO: callback
export async function GET() {
  const config = await getClientConfiguration();

  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();

  return new Response(null, {
    status: 302,
    headers: {
      'Location': client
        .buildAuthorizationUrl(config, {
          redirect_uri: `https://localhost/api/callback`, // TODO: Configure
          scope: 'openid', // TODO: configure
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          state: state,
        })
        .toString(),
      'Set-Cookie': serialize('state', await encrypt({ state, codeVerifier }), {
        httpOnly: true,
        maxAge: 10 * 60, // 10 minutes
        path: '/',
      }),
    },
  });
}
