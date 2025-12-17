import { registerAs } from '@nestjs/config';
import z from 'zod';

export interface PseudonymizationConfig {
  PSEUDONYMIZATION_SALT_ENDPOINT: string;
  PSEUDONYMIZATION_SALT: string;
  PSEUDONYMIZATION_SECTOR_IDENTIFIER: string;
}

const pseudonymizationConfigSchema = z.object({
  PSEUDONYMIZATION_SALT_ENDPOINT: z.string(),
  PSEUDONYMIZATION_SALT: z.string(),
  PSEUDONYMIZATION_SECTOR_IDENTIFIER: z.string(),
});

export default registerAs('pseudonymizationConfig', (): PseudonymizationConfig => {
  const env = {
    PSEUDONYMIZATION_SALT_ENDPOINT: process.env.PSEUDONYMIZATION_SALT_ENDPOINT,
    PSEUDONYMIZATION_SALT: process.env.PSEUDONYMIZATION_SALT,
    PSEUDONYMIZATION_SECTOR_IDENTIFIER: process.env.PSEUDONYMIZATION_SECTOR_IDENTIFIER,
  };

  // Validate the config
  const validationResult = pseudonymizationConfigSchema.safeParse(env);

  if (validationResult.error) {
    throw validationResult.error;
  }

  return validationResult.data;
});
