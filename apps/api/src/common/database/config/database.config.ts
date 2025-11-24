import { registerAs } from '@nestjs/config';
import z from 'zod';

export interface DatabaseConfig {
  MAIN_URL: string;
  REPLICA_URL: string;
}

const databaseConfigSchema = z.object({
  MAIN_URL: z.url(),
  REPLICA_URL: z.url(),
});

export default registerAs('database', (): DatabaseConfig => {
  const env = {
    MAIN_URL: process.env.DB_MAIN_URL ?? undefined,
    REPLICA_URL: process.env.DB_REPLICA_URL ?? undefined,
  };

  const validationResult = databaseConfigSchema.safeParse(env);

  if (validationResult.error) {
    throw validationResult.error;
  }

  return validationResult.data;
});
