import { registerAs } from '@nestjs/config';

import z from 'zod';
import { type IdmApiWithClientCredentialConfig } from './idm-config.interface';

export type EduplacesStagingConfig =
  IdmApiWithClientCredentialConfig<'IDM_EDUPLACES_STAGING'>;

const eduplacesStagingConfigSchema = z.discriminatedUnion(
  'IDM_EDUPLACES_STAGING_ENABLED',
  [
    z.object({
      IDM_EDUPLACES_STAGING_TOKEN_ENDPOINT: z.url(),
      IDM_EDUPLACES_STAGING_API_ENDPOINT: z.url(),
      IDM_EDUPLACES_STAGING_CLIENT_ID: z.string(),
      IDM_EDUPLACES_STAGING_CLIENT_SECRET: z.string(),
      IDM_EDUPLACES_STAGING_ENABLED: z.literal(true),
    }),
    z.object({
      IDM_EDUPLACES_STAGING_ENABLED: z.literal(false),
    }),
  ],
);

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
      IDM_EDUPLACES_STAGING_ENABLED:
        process.env.IDM_EDUPLACES_STAGING_ENABLED === 'true',
    };

    // Validate the config
    const validationResult = eduplacesStagingConfigSchema.safeParse(env);

    if (validationResult.error) {
      throw validationResult.error;
    }

    return validationResult.data;
  },
);
