export interface Config {
  selfBaseUrl: string;
  clientId: string;
  clientSecret: string;
  authUrl: string;
  apiBaseUrl: string;
  sessionCookieName: string;
  scopes: string;
}

export function getConfig(): Config {
  const selfBaseUrl = process.env.SELF_BASE_URL;
  if (!selfBaseUrl) {
    throw new Error('Missing Environment Variable SELF_BASE_URL');
  }
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
    selfBaseUrl,
    clientId: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    authUrl: process.env.AUTH_URL,
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3010',
    sessionCookieName: 'session',
    scopes: process.env.AUTH_REQUESTED_SCOPES ?? 'openid',
  };
}
