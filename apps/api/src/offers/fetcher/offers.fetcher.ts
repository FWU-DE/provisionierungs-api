import { Inject, Injectable } from '@nestjs/common';

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

@Injectable()
export class OffersFetcher {
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
    const username = this.offersConfig.OFFERS_CLIENT_ID;
    const password = this.offersConfig.OFFERS_CLIENT_SECRET;

    const response = await fetch(endpointUrl, {
      method: 'GET',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
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

    // Validate response schema
    return this.validateData(data);
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
