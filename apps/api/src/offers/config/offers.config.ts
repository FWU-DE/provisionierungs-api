import { registerAs } from '@nestjs/config';
import z from 'zod';

export interface OffersConfig {
  OFFERS_API_ENDPOINT: string;
  OFFERS_CLIENT_ID: string;
  OFFERS_CLIENT_SECRET: string;
}

const offersConfigSchema = z.object({
  OFFERS_API_ENDPOINT: z.string(),
  OFFERS_CLIENT_ID: z.string(),
  OFFERS_CLIENT_SECRET: z.string(),
});

export default registerAs('offersConfig', (): OffersConfig => {
  const env = {
    OFFERS_API_ENDPOINT: process.env.OFFERS_API_ENDPOINT,
    OFFERS_CLIENT_ID: process.env.OFFERS_CLIENT_ID,
    OFFERS_CLIENT_SECRET: process.env.OFFERS_CLIENT_SECRET,
  };

  // Validate the config
  const validationResult = offersConfigSchema.safeParse(env);

  if (validationResult.error) {
    throw validationResult.error;
  }

  return validationResult.data;
});
