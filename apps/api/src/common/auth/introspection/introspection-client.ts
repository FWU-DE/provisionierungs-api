import { Inject, Injectable } from '@nestjs/common';
import authConfig, { type AuthConfig } from '../config/auth.config';
import { Logger } from '../../logger';
import z from 'zod';

export const keycloakIntrospectionSchema = z.discriminatedUnion('active', [
  z.object({ active: z.literal(false) }),
  z.object({
    active: z.literal(true),
    scope: z.string(),
    client_id: z.string().optional(),
    sub: z.string(),
    username: z.string(),
    typ: z.enum(['Bearer', 'ID']),
    sid: z.string().optional(),
    heimatorganisation: z.string().optional(),
    schulkennung: z.array(z.string()).optional(),
  }),
]);

export type KeycloakIntrospection = z.infer<typeof keycloakIntrospectionSchema>;

@Injectable()
export class IntrospectionClient {
  constructor(
    @Inject(authConfig.KEY) private readonly authConfig: AuthConfig,
    private readonly logger: Logger,
  ) {}

  async getIntrospectionResponse(
    accessToken: string,
  ): Promise<KeycloakIntrospection> {
    if (this.authConfig.AUTH_VALIDATION !== 'introspect') {
      throw new Error(
        'IntrospectionClient: AUTH_VALIDATION is not set to introspect.',
      );
    }

    const response = await fetch(this.authConfig.AUTH_INTROSPECTION_URL, {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(
            `${this.authConfig.AUTH_CLIENT_ID}:${this.authConfig.AUTH_CLIENT_SECRET}`,
          ).toString('base64'),
      },
      body: new URLSearchParams({ token: accessToken }),
    });

    if (!response.ok) {
      this.logger.error(
        `Failed to fetch token introspection: ${String(response.status)} ${response.statusText}}`,
      );
      this.logger.error(`Response: ${await response.text()}`);
      return { active: false };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();
    const { error, data: parsedData } =
      keycloakIntrospectionSchema.safeParse(data);
    if (error) {
      this.logger.error(
        `Token introspection response is invalid: ${error.message}`,
      );
      return { active: false };
    }

    return parsedData;
  }
}
