import { BearerToken } from './bearer-token';
import z from 'zod';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from '../../common/logger';

export const clientCredentialsResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  scope: z.string(),
  token_type: z.enum(['bearer']),
});

@Injectable()
export class ClientCredentialsProvider {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
  ) {}

  // @todo: Implement access token cache for IDMs? This might save one request and therefore some milliseconds...

  async authenticate(
    endpointUrl: string,
    username: string,
    password: string,
    grantType = 'client_credentials',
    scope = '',
  ): Promise<BearerToken> {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: grantType,
        scope: scope,
      }),
    });

    if (!response.ok) {
      this.logger.error(
        `Failed to authenticate towards IDM: ${await response.text()}`,
      );
      throw new Error('Authorization towards Schulconnex failed.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();

    // Validate response schema
    const { error, data: parsedData } =
      clientCredentialsResponseSchema.safeParse(data);
    if (error || !parsedData.access_token) {
      this.logger.error(`IDM response is invalid: ${error?.message ?? ''}`);
      throw new Error('Authorization towards Schulconnex failed.');
    }

    return {
      token: parsedData.access_token,
    };
  }
}
