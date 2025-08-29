import { Inject, Injectable } from '@nestjs/common';
import authConfig, { type AuthConfig } from '../../config/auth.config';
import {
  keycloakIntrospectionSchema,
  type KeycloakIntrospection,
} from '../interfaces/request-with-introspection.interface';
import { Logger } from '../../logger';

@Injectable()
export class IntrospectionClient {
  constructor(
    @Inject(authConfig.KEY) private readonly authConfig: AuthConfig,
    private readonly logger: Logger,
  ) {}

  async getIntrospectionResponse(
    accessToken: string,
  ): Promise<KeycloakIntrospection> {
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
