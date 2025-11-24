import { registerAs } from '@nestjs/config';

import z from 'zod';

interface BaseAuthConfig {
  AUTH_CLIENT_ID: string;
  AUTH_CLIENT_SECRET: string;
}

export type AuthConfig =
  | ({
      AUTH_VALIDATION: 'verify-jwt';
      AUTH_WELL_KNOWN_URL: string;
    } & BaseAuthConfig)
  | ({
      AUTH_VALIDATION: 'introspect';
      AUTH_INTROSPECTION_URL: string;
    } & BaseAuthConfig)
  | ({
      AUTH_VALIDATION: 'off';
    } & BaseAuthConfig);

const authConfigSchema = z.discriminatedUnion('AUTH_VALIDATION', [
  z.object({
    AUTH_VALIDATION: z.literal('introspect'),
    AUTH_INTROSPECTION_URL: z.url(),
    AUTH_CLIENT_ID: z.string(),
    AUTH_CLIENT_SECRET: z.string(),
  }),
  z.object({
    AUTH_VALIDATION: z.literal('verify-jwt'),
    AUTH_WELL_KNOWN_URL: z.url(),
    AUTH_CLIENT_ID: z.string(),
    AUTH_CLIENT_SECRET: z.string(),
  }),
  z.object({
    AUTH_VALIDATION: z.literal('off'),
    AUTH_CLIENT_ID: z.string().optional().default(''),
    AUTH_CLIENT_SECRET: z.string().optional().default(''),
  }),
]);

export default registerAs('authConfig', (): AuthConfig => {
  const env = {
    AUTH_VALIDATION: process.env.AUTH_VALIDATION ?? 'verify-jwt',
    AUTH_WELL_KNOWN_URL: process.env.AUTH_WELL_KNOWN_URL,
    AUTH_INTROSPECTION_URL: process.env.AUTH_INTROSPECTION_URL,
    AUTH_CLIENT_ID: process.env.AUTH_CLIENT_ID,
    AUTH_CLIENT_SECRET: process.env.AUTH_CLIENT_SECRET,
  };

  // Validate the config
  const validationResult = authConfigSchema.safeParse(env);

  if (validationResult.error) {
    throw validationResult.error;
  }

  if (validationResult.data.AUTH_VALIDATION === 'off') {
    // eslint-disable-next-line no-console
    console.error(
      'WARNING: AUTH_VALIDATION is set to "off". The API will not perform any authentication or authorization checks!',
    );
  }

  return validationResult.data;
});
