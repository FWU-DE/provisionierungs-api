import { Injectable } from '@nestjs/common';

import { OffersDto } from './dto/offers.dto';
import { OffersFetcher } from './fetcher/offers.fetcher';
import { OffersResponse } from './model/response/offers.model';

@Injectable()
export class OffersService {
  constructor(private readonly fetcher: OffersFetcher) {}

  public async getOffers(schoolId: string[]): Promise<OffersDto[]> {
    const offersResponse: OffersResponse[] = (
      await this.fetcher.fetchActiveOffers(schoolId)
    ).filter((response) => response !== null);

    return offersResponse.flatMap((response) => {
      return response.items.map((item) => {
        const dto = new OffersDto();
        dto.educationProviderOrganizationName = item.educationProviderOrganizationName;
        dto.offerDescription = item.offerDescription ?? '';
        dto.offerId = item.offerId;
        dto.offerLink = item.offerLink ?? '';
        dto.offerLogo = item.offerLogo ?? '';
        dto.offerLongTitle = item.offerLongTitle ?? '';
        dto.offerResourcePk = item.offerResourcePk ?? 0;
        dto.offerStatus = item.offerStatus ?? '';
        dto.offerTitle = item.offerTitle ?? '';
        dto.offerVersion = item.offerVersion ?? 0;
        return dto;
      });
    });
  }
}
