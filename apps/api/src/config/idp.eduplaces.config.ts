import { registerAs } from '@nestjs/config';

import z from 'zod';

export interface EduplacesConfig {
  IDP_EDUPLACES_TOKEN_ENDPOINT: string;
  IDP_EDUPLACES_API_ENDPOINT: string;
  IDP_EDUPLACES_CLIENT_ID: string;
  IDP_EDUPLACES_CLIENT_SECRET: string;
}

const eduplacesConfigSchema = z.object({
  IDP_EDUPLACES_TOKEN_ENDPOINT: z.url(),
  IDP_EDUPLACES_API_ENDPOINT: z.url(),
  IDP_EDUPLACES_CLIENT_ID: z.string(),
  IDP_EDUPLACES_CLIENT_SECRET: z.string(),
});

export default registerAs('idpEduplacesConfig', (): EduplacesConfig => {
  const env = {
    IDP_EDUPLACES_TOKEN_ENDPOINT: process.env.IDP_EDUPLACES_TOKEN_ENDPOINT,
    IDP_EDUPLACES_API_ENDPOINT: process.env.IDP_EDUPLACES_API_ENDPOINT,
    IDP_EDUPLACES_CLIENT_ID: process.env.IDP_EDUPLACES_CLIENT_ID,
    IDP_EDUPLACES_CLIENT_SECRET: process.env.IDP_EDUPLACES_CLIENT_SECRET,
  };

  // Validate the config
  const validationResult = eduplacesConfigSchema.safeParse(env);

  if (validationResult.error) {
    throw validationResult.error;
  }

  return validationResult.data;
});
