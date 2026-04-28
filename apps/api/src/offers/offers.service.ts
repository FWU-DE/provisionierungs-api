import { Inject, Injectable } from '@nestjs/common';

import { Logger } from '../common/logger';
import { OffersDto } from './dto/offers.dto';
import { OffersFetcher } from './fetcher/offers.fetcher';
import { OfferItem } from './model/response/offer-item.model';
import { OffersResponse } from './model/response/offers.model';

function isOfferItem(item: unknown): item is OfferItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'educationProviderOrganizationName' in item &&
    'offerId' in item &&
    'offerTitle' in item &&
    'offerLongTitle' in item &&
    'offerDescription' in item &&
    'offerLink' in item &&
    'offerLogo' in item
  );
}

@Injectable()
export class OffersService {
  constructor(
    private readonly fetcher: OffersFetcher,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    this.logger.setContext(OffersService.name);
  }

  public async getOffers(schoolIds: string[]): Promise<OffersDto[]> {
    this.logger.debug(`OffersService: Getting offers for school IDs.`, {
      schoolIds: schoolIds,
    });
    const offersResponses: OffersResponse[] = (
      await this.fetcher.fetchActiveOffers(schoolIds)
    ).filter((response) => response !== null);

    const seenOfferIds = new Set<number>();
    return offersResponses.flatMap((response) => {
      return response.items
        .map((item) => this.mapToDto(item))
        .filter((dto) => {
          if (seenOfferIds.has(dto.offerId)) {
            return false;
          }
          seenOfferIds.add(dto.offerId);
          return true;
        });
    });
  }

  public async getOfferById(schoolIds: string[], offerId: number): Promise<OffersDto | null> {
    const offers = await this.getOffers(schoolIds);
    return offers.find((offer) => offer.offerId === offerId) ?? null;
  }

  public async getOffersGroupedBySchool(schoolIds: string[]): Promise<Map<string, OffersDto[]>> {
    const responses = await this.fetcher.fetchActiveOffers(schoolIds);

    const groupedOffers = new Map<string, OffersDto[]>();

    responses.forEach((response, index) => {
      const schoolId = schoolIds[index];
      if (response === null) {
        groupedOffers.set(schoolId, []);
        return;
      }

      groupedOffers.set(
        schoolId,
        response.items.map((item) => this.mapToDto(item)),
      );
    });

    return groupedOffers;
  }

  public async getOfferByIdGroupedBySchool(
    schoolIds: string[],
    offerId: number,
  ): Promise<Map<string, OffersDto | null>> {
    const groupedOffers = await this.getOffersGroupedBySchool(schoolIds);

    const result = new Map<string, OffersDto | null>();
    groupedOffers.forEach((offers, schoolId) => {
      result.set(schoolId, offers.find((offer) => offer.offerId === offerId) ?? null);
    });

    return result;
  }

  private mapToDto(item: unknown): OffersDto {
    if (!isOfferItem(item)) {
      this.logger.warn('OffersService: Skipping invalid offer item structure during mapping.', {
        item,
      });
      throw new Error('Invalid offer item structure');
    }

    const dto = new OffersDto();
    dto.educationProviderOrganizationName = item.educationProviderOrganizationName;
    dto.offerId = item.offerId;
    dto.offerTitle = item.offerTitle ?? '';
    dto.offerLongTitle = item.offerLongTitle ?? '';
    dto.offerDescription = item.offerDescription ?? '';
    dto.offerLink = item.offerLink ?? '';
    dto.offerLogo = item.offerLogo ?? '';
    return dto;
  }
}
