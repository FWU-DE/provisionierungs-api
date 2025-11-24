import { registerAs } from '@nestjs/config';

import z from 'zod';
import type { IdmApiWithClientCredentialConfig } from './idm-config.interface';

export type EduplacesConfig = IdmApiWithClientCredentialConfig<'IDM_EDUPLACES'>;

const eduplacesConfigSchema = z.object({
  IDM_EDUPLACES_TOKEN_ENDPOINT: z.url(),
  IDM_EDUPLACES_API_ENDPOINT: z.url(),
  IDM_EDUPLACES_CLIENT_ID: z.string(),
  IDM_EDUPLACES_CLIENT_SECRET: z.string(),
});

export default registerAs('idmEduplacesConfig', (): EduplacesConfig => {
  const env = {
    IDM_EDUPLACES_TOKEN_ENDPOINT: process.env.IDM_EDUPLACES_TOKEN_ENDPOINT,
    IDM_EDUPLACES_API_ENDPOINT: process.env.IDM_EDUPLACES_API_ENDPOINT,
    IDM_EDUPLACES_CLIENT_ID: process.env.IDM_EDUPLACES_CLIENT_ID,
    IDM_EDUPLACES_CLIENT_SECRET: process.env.IDM_EDUPLACES_CLIENT_SECRET,
  };

  // Validate the config
  const validationResult = eduplacesConfigSchema.safeParse(env);

  if (validationResult.error) {
    throw validationResult.error;
  }

  return validationResult.data;
});
