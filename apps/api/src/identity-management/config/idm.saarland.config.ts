import { registerAs } from '@nestjs/config';
import z from 'zod';

import type { IdmApiWithClientCredentialConfig } from './idm-config.interface';

export type SaarlandConfig = IdmApiWithClientCredentialConfig<'IDM_SAARLAND'> &
  (
    | {
        IDM_SAARLAND_ENABLED: true;
        IDM_SAARLAND_SCOPE: string;
        IDM_SAARLAND_RESOURCE: string;
      }
    | { IDM_SAARLAND_ENABLED: false }
  );

const saarlandConfigSchema = z.discriminatedUnion('IDM_SAARLAND_ENABLED', [
  z.object({
    IDM_SAARLAND_TOKEN_ENDPOINT: z.url(),
    IDM_SAARLAND_API_ENDPOINT: z.url(),
    IDM_SAARLAND_CLIENT_ID: z.string(),
    IDM_SAARLAND_CLIENT_SECRET: z.string(),
    IDM_SAARLAND_SCOPE: z.string(),
    IDM_SAARLAND_RESOURCE: z.string(),
    IDM_SAARLAND_ENABLED: z.literal(true),
  }),
  z.object({
    IDM_SAARLAND_ENABLED: z.literal(false),
  }),
]);

export default registerAs('idmSaarlandConfig', (): SaarlandConfig => {
  const env = {
    IDM_SAARLAND_TOKEN_ENDPOINT: process.env.IDM_SAARLAND_TOKEN_ENDPOINT,
    IDM_SAARLAND_API_ENDPOINT: process.env.IDM_SAARLAND_API_ENDPOINT,
    IDM_SAARLAND_CLIENT_ID: process.env.IDM_SAARLAND_CLIENT_ID,
    IDM_SAARLAND_CLIENT_SECRET: process.env.IDM_SAARLAND_CLIENT_SECRET,
    IDM_SAARLAND_SCOPE: process.env.IDM_SAARLAND_SCOPE,
    IDM_SAARLAND_RESOURCE: process.env.IDM_SAARLAND_RESOURCE,
    IDM_SAARLAND_ENABLED: process.env.IDM_SAARLAND_ENABLED === 'true',
  };

  // Validate the config
  const validationResult = saarlandConfigSchema.safeParse(env);

  if (validationResult.error) {
    throw validationResult.error;
  }

  return validationResult.data;
});
