import { registerAs } from '@nestjs/config';
import z from 'zod';

import type { IdmApiWithClientCredentialConfig } from './idm-config.interface';

export type EduplacesConfig = IdmApiWithClientCredentialConfig<'IDM_EDUPLACES'>;

const eduplacesConfigSchema = z.discriminatedUnion('IDM_EDUPLACES_ENABLED', [
  z.object({
    IDM_EDUPLACES_TOKEN_ENDPOINT: z.url(),
    IDM_EDUPLACES_API_ENDPOINT: z.url(),
    IDM_EDUPLACES_CLIENT_ID: z.string(),
    IDM_EDUPLACES_CLIENT_SECRET: z.string(),
    IDM_EDUPLACES_ENABLED: z.literal(true),
  }),
  z.object({
    IDM_EDUPLACES_ENABLED: z.literal(false),
  }),
]);

export default registerAs('idmEduplacesConfig', (): EduplacesConfig => {
  const env = {
    IDM_EDUPLACES_TOKEN_ENDPOINT: process.env.IDM_EDUPLACES_TOKEN_ENDPOINT,
    IDM_EDUPLACES_API_ENDPOINT: process.env.IDM_EDUPLACES_API_ENDPOINT,
    IDM_EDUPLACES_CLIENT_ID: process.env.IDM_EDUPLACES_CLIENT_ID,
    IDM_EDUPLACES_CLIENT_SECRET: process.env.IDM_EDUPLACES_CLIENT_SECRET,
    IDM_EDUPLACES_ENABLED: process.env.IDM_EDUPLACES_ENABLED === 'true',
  };

  // Validate the config
  const validationResult = eduplacesConfigSchema.safeParse(env);

  if (validationResult.error) {
    throw validationResult.error;
  }

  return validationResult.data;
});
