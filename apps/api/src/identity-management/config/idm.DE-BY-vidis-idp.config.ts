import { registerAs } from '@nestjs/config';

import z from 'zod';
import { type IdmApiWithClientCredentialConfig } from './idm-config.interface';

export type DE_BY_vidis_idpConfig =
  IdmApiWithClientCredentialConfig<'IDM_DE_BY_VIDIS_IDP'>;

const de_by_vidis_idpConfigSchema = z.object({
  IDM_DE_BY_VIDIS_IDP_TOKEN_ENDPOINT: z.url(),
  IDM_DE_BY_VIDIS_IDP_API_ENDPOINT: z.url(),
  IDM_DE_BY_VIDIS_IDP_CLIENT_ID: z.string(),
  IDM_DE_BY_VIDIS_IDP_CLIENT_SECRET: z.string(),
});

export default registerAs(
  'idmBY_DE_vidis_idpConfig',
  (): DE_BY_vidis_idpConfig => {
    const env = {
      IDM_DE_BY_VIDIS_IDP_TOKEN_ENDPOINT:
        process.env.IDM_DE_BY_VIDIS_IDP_TOKEN_ENDPOINT,
      IDM_DE_BY_VIDIS_IDP_API_ENDPOINT:
        process.env.IDM_DE_BY_VIDIS_IDP_API_ENDPOINT,
      IDM_DE_BY_VIDIS_IDP_CLIENT_ID: process.env.IDM_DE_BY_VIDIS_IDP_CLIENT_ID,
      IDM_DE_BY_VIDIS_IDP_CLIENT_SECRET:
        process.env.IDM_DE_BY_VIDIS_IDP_CLIENT_SECRET,
    };

    // Validate the config
    const validationResult = de_by_vidis_idpConfigSchema.safeParse(env);

    if (validationResult.error) {
      throw validationResult.error;
    }

    return validationResult.data;
  },
);
