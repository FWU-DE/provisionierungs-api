import { registerAs } from '@nestjs/config';

import z from 'zod';
import { type IdmApiWithClientCredentialConfig } from './idm-config.interface';

export type EduplacesStagingConfig =
  IdmApiWithClientCredentialConfig<'IDP_EDUPLACES_STAGING'>;

const eduplacesStagingConfigSchema = z.object({
  IDP_EDUPLACES_STAGING_TOKEN_ENDPOINT: z.url(),
  IDP_EDUPLACES_STAGING_API_ENDPOINT: z.url(),
  IDP_EDUPLACES_STAGING_CLIENT_ID: z.string(),
  IDP_EDUPLACES_STAGING_CLIENT_SECRET: z.string(),
});

export default registerAs(
  'idpEduplacesStagingConfig',
  (): EduplacesStagingConfig => {
    const env = {
      IDP_EDUPLACES_STAGING_TOKEN_ENDPOINT:
        process.env.IDP_EDUPLACES_STAGING_TOKEN_ENDPOINT,
      IDP_EDUPLACES_STAGING_API_ENDPOINT:
        process.env.IDP_EDUPLACES_STAGING_API_ENDPOINT,
      IDP_EDUPLACES_STAGING_CLIENT_ID:
        process.env.IDP_EDUPLACES_STAGING_CLIENT_ID,
      IDP_EDUPLACES_STAGING_CLIENT_SECRET:
        process.env.IDP_EDUPLACES_STAGING_CLIENT_SECRET,
    };

    // Validate the config
    const validationResult = eduplacesStagingConfigSchema.safeParse(env);

    if (validationResult.error) {
      throw validationResult.error;
    }

    return validationResult.data;
  },
);
