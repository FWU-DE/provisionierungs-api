import { registerAs } from '@nestjs/config';

import z from 'zod';

export interface PseudonymizationConfig {
  PSEUDONYMIZATION_SALT_ENDPOINT: string;
}

const pseudonymizationConfigSchema = z.object({
  PSEUDONYMIZATION_SALT_ENDPOINT: z.string(),
});

export default registerAs(
  'pseudonymizationConfig',
  (): PseudonymizationConfig => {
    const env = {
      PSEUDONYMIZATION_SALT_ENDPOINT:
        process.env.PSEUDONYMIZATION_SALT_ENDPOINT,
    };

    // Validate the config
    const validationResult = pseudonymizationConfigSchema.safeParse(env);

    if (validationResult.error) {
      throw validationResult.error;
    }

    return validationResult.data;
  },
);
