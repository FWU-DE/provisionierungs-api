import { BearerToken } from './bearer-token';
import z from 'zod';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from '../../common/logger';

export const formUrlEncodedResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.enum(['Bearer']),
});

@Injectable()
export class FormUrlEncodedProvider {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
  ) {}

  // @todo: Implement access token cache for IDMs? This might save one request and therefore some milliseconds...

  async authenticate(
    endpointUrl: string,
    clientId: string,
    clientSecret: string,
    grantType = 'client_credentials',
    scope = '',
    resource = '',
  ): Promise<BearerToken> {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        ContentType: 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: grantType,
        scope: scope,
        resource: resource,
      }),
    });

    if (!response.ok) {
      this.logger.error(
        `Failed to authenticate towards IDM: ${await response.text()}`,
      );
      throw new Error('Authorization towards IDM failed.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();

    // Validate response schema
    const { error, data: parsedData } =
      formUrlEncodedResponseSchema.safeParse(data);
    if (error || !parsedData.access_token) {
      this.logger.error(`IDM response is invalid: ${error?.message ?? ''}`);
      throw new Error('Authorization towards IDM failed.');
    }

    return {
      token: parsedData.access_token,
    };
  }
}
