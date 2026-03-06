import { Injectable } from '@nestjs/common';

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
  constructor(private readonly fetcher: OffersFetcher) {}

  public async getOffers(schoolId: string[]): Promise<OffersDto[]> {
    const offersResponse: OffersResponse[] = (
      await this.fetcher.fetchActiveOffers(schoolId)
    ).filter((response) => response !== null);

    return offersResponse.flatMap((response) => {
      return response.items.map((item) => {
        return this.mapToDto(item);
      });
    });
  }

  public async getOfferById(schoolIds: string[], offerId: number): Promise<OffersDto | null> {
    const offers = await this.getOffers(schoolIds);
    return offers.find((offer) => offer.offerId === offerId) ?? null;
  }

  private mapToDto(item: unknown): OffersDto {
    if (!isOfferItem(item)) {
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
