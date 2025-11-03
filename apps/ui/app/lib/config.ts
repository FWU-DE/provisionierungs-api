export interface Config {
  clientId: string;
  clientSecret: string;
  url: string;
  apiBaseUrl: string;
}

export function getConfig(): Config {
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
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3010',
  };
}
