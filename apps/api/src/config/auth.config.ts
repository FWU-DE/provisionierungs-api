import { registerAs } from '@nestjs/config';

import z from 'zod';

export interface AuthConfig {
  AUTH_INTROSPECTION_URL: string;
  AUTH_CLIENT_ID: string;
  AUTH_CLIENT_SECRET: string;
}

const authConfigSchema = z.object({
  AUTH_INTROSPECTION_URL: z.url(),
  AUTH_CLIENT_ID: z.string(),
  AUTH_CLIENT_SECRET: z.string(),
});

export default registerAs('authConfig', (): AuthConfig => {
  const env = {
    AUTH_INTROSPECTION_URL: process.env.AUTH_INTROSPECTION_URL,
    AUTH_CLIENT_ID: process.env.AUTH_CLIENT_ID,
    AUTH_CLIENT_SECRET: process.env.AUTH_CLIENT_SECRET,
  };

  // Validate the config
  const validationResult = authConfigSchema.safeParse(env);

  if (validationResult.error) {
    throw validationResult.error;
  }

  return validationResult.data;
});
