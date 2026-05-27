import { Inject, Injectable } from '@nestjs/common';
import z from 'zod';

import { Logger } from '../../common/logger';
import offersConfig, { type OffersConfig } from '../config/offers.config';
import { OfferItem } from '../model/response/offer-item.model';
import { OffersResponse } from '../model/response/offers.model';
import { activatedOffersBySchoolResponseSchema } from '../offers.validator';

enum OfferFetchMode {
  ALL = 'all',
  ACTIVATED_BY_SCHOOL = 'activated/by-school/',
}

interface FetchOptions {
  schoolId: string;
}

const offersAccessTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().int().nonnegative(),
  token_type: z.enum(['bearer', 'Bearer']),
});

@Injectable()
export class OffersFetcher {
  private accessToken: string | null = null;
  private accessTokenExpiresAt = 0;
  private tokenRequestPromise: Promise<string> | null = null;

  constructor(
    @Inject(offersConfig.KEY)
    private readonly offersConfig: OffersConfig,
    @Inject(Logger)
    protected readonly logger: Logger,
  ) {
    this.logger.setContext(OffersFetcher.name);
  }

  private async fetchOffers(
    mode: OfferFetchMode,
    options: undefined | FetchOptions = undefined,
  ): Promise<OffersResponse | null> {
    if (mode === OfferFetchMode.ACTIVATED_BY_SCHOOL && !options?.schoolId) {
      throw new Error(
        'No schoolId provided! Fetching for activated offers fy school requires a schoolId.',
      );
    }

    const endpointUrl =
      this.offersConfig.OFFERS_API_ENDPOINT + '/offers/' + mode + (options?.schoolId ?? '');
    const bearerToken = await this.getBearerToken();

    this.logger.debug(`OffersFetcher: Requesting offers from ${endpointUrl}`);
    const response = await fetch(endpointUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });

    // Get data
    if (!response.ok) {
      this.logger.error(
        `Failed to fetch offer data: ${String(response.status)} ${response.statusText}`,
      );
      this.logger.error(`Response: ${await response.text()}`);
      return null;
    }
    const data = new OffersResponse((await response.json()) as OffersResponse);
    const validatedData = this.validateData(data);

    this.logger.debug(`OffersFetcher: Received offers from ${endpointUrl}`, {
      offerCount: validatedData?.items.length ?? 0,
      // offers: validatedData,
    });

    this.logger.debug(`OffersFetcher: Received offers from ${endpointUrl}`, {
      // data: data,
    });

    // Validate response schema
    return validatedData;
  }

  private async getBearerToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.accessTokenExpiresAt) {
      return this.accessToken;
    }

    if (this.tokenRequestPromise) {
      return await this.tokenRequestPromise;
    }

    this.tokenRequestPromise = this.fetchAccessToken();

    try {
      return await this.tokenRequestPromise;
    } finally {
      this.tokenRequestPromise = null;
    }
  }

  private async fetchAccessToken(): Promise<string> {
    const tokenEndpointUrl = `${new URL(this.offersConfig.OFFERS_API_ENDPOINT).origin}/o/oauth2/token`;
    const clientId = this.offersConfig.OFFERS_CLIENT_ID;
    const clientSecret = this.offersConfig.OFFERS_CLIENT_SECRET;

    const response = await fetch(tokenEndpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      this.logger.error(
        `Failed to fetch offers access token: ${String(response.status)} ${response.statusText}`,
      );
      throw new Error('Authorization towards Offers API failed.');
    }

    const tokenResponse: unknown = await response.json();
    const { error, data: parsedData } = offersAccessTokenResponseSchema.safeParse(tokenResponse);

    if (error) {
      throw new Error(`Schema Validation | Offers token response is invalid: ${error.message}`);
    }

    this.accessToken = parsedData.access_token;
    this.accessTokenExpiresAt = Date.now() + parsedData.expires_in * 1000;

    return parsedData.access_token;
  }

  public async fetchActiveOffers(schoolIds: string[]): Promise<(OffersResponse | null)[]> {
    return await Promise.all(
      schoolIds.map(async (schoolId) => {
        return await this.fetchOffers(OfferFetchMode.ACTIVATED_BY_SCHOOL, {
          schoolId: schoolId,
        });
      }),
    );
  }

  public async fetchOfferForClientId(clientId: string): Promise<OfferItem | null> {
    const offerData = await this.fetchOffers(OfferFetchMode.ALL);
    return offerData?.items.find((offerItem) => offerItem.clientId.includes(clientId)) ?? null;
  }

  private validateData(data: OffersResponse): OffersResponse | null {
    const { error, data: parsedData } = activatedOffersBySchoolResponseSchema.safeParse(data);
    if (error) {
      throw new Error(`Schema Validation | Offers response is invalid: ${error.message}`);
    }
    return new OffersResponse(parsedData);
  }
}
