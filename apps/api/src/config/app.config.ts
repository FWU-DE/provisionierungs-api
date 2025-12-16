import { registerAs } from '@nestjs/config';
import z from 'zod';

export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

function nodeEnvStringToEnum(env: string | undefined): NodeEnv {
  switch (env) {
    case NodeEnv.PRODUCTION:
      return NodeEnv.PRODUCTION;
    case NodeEnv.TEST:
      return NodeEnv.TEST;
    default:
      return NodeEnv.DEVELOPMENT;
  }
}
export interface AppConfig {
  NODE_ENV: NodeEnv;
  PORT: number;
}

const authConfigSchema = z.object({
  NODE_ENV: z.enum(NodeEnv),
  PORT: z.number().min(1).max(65535).default(3010),
});

export default registerAs('appConfig', (): AppConfig => {
  const env = {
    NODE_ENV: nodeEnvStringToEnum(process.env.NODE_ENV),
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3010,
  };

  // Validate the config
  const validationResult = authConfigSchema.safeParse(env);

  if (validationResult.error) {
    throw validationResult.error;
  }

  return validationResult.data;
});
