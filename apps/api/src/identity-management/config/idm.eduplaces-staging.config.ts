import { registerAs } from '@nestjs/config';

import z from 'zod';
import { type IdmApiWithClientCredentialConfig } from './idm-config.interface';

export type EduplacesStagingConfig =
  IdmApiWithClientCredentialConfig<'IDM_EDUPLACES_STAGING'>;

const eduplacesStagingConfigSchema = z.object({
  IDM_EDUPLACES_STAGING_TOKEN_ENDPOINT: z.url(),
  IDM_EDUPLACES_STAGING_API_ENDPOINT: z.url(),
  IDM_EDUPLACES_STAGING_CLIENT_ID: z.string(),
  IDM_EDUPLACES_STAGING_CLIENT_SECRET: z.string(),
});

export default registerAs(
  'idmEduplacesStagingConfig',
  (): EduplacesStagingConfig => {
    const env = {
      IDM_EDUPLACES_STAGING_TOKEN_ENDPOINT:
        process.env.IDM_EDUPLACES_STAGING_TOKEN_ENDPOINT,
      IDM_EDUPLACES_STAGING_API_ENDPOINT:
        process.env.IDM_EDUPLACES_STAGING_API_ENDPOINT,
      IDM_EDUPLACES_STAGING_CLIENT_ID:
        process.env.IDM_EDUPLACES_STAGING_CLIENT_ID,
      IDM_EDUPLACES_STAGING_CLIENT_SECRET:
        process.env.IDM_EDUPLACES_STAGING_CLIENT_SECRET,
    };

    // Validate the config
    const validationResult = eduplacesStagingConfigSchema.safeParse(env);

    if (validationResult.error) {
      throw validationResult.error;
    }

    return validationResult.data;
  },
);
