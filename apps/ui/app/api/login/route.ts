/* eslint-disable turbo/no-undeclared-env-vars */
import * as client from 'openid-client';

// TODO: callback
export async function GET() {
  const config = await getClientConfiguration();

  const codeVerifier = client.randomPKCECodeVerifier(); // TODO: persist in session
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();

  return Response.redirect(
    client.buildAuthorizationUrl(config, {
      redirect_uri: `https://localhost/api/callback`, // TODO: Configure
      scope: 'openid', // TODO: configure
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: state,
    }),
    302,
  );
}

async function getClientConfiguration() {
  const { clientId, clientSecret, url } = getConfig();
  return await client.discovery(new URL(url), clientId, clientSecret);
}

interface Config {
  clientId: string;
  clientSecret: string;
  url: string;
}
function getConfig(): Config {
  if (process.env.AUTH_CLIENT_ID === undefined) {
    throw new Error('Missing AUTH_CLIENT_ID env variable');
  }
  if (process.env.AUTH_CLIENT_SECRET === undefined) {
    throw new Error('Missing AUTH_CLIENT_SECRET env variable');
  }
  if (process.env.AUTH_URL === undefined) {
    throw new Error('Missing AUTH_URL env variable');
  }
  return {
    clientId: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    url: process.env.AUTH_URL,
  };
}
