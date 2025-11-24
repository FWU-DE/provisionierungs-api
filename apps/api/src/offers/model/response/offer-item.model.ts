import { OfferCategories } from './offer-categories.model';

export class OfferItem {
  clientId: string[];
  educationProviderOrganizationId?: number;
  educationProviderOrganizationName: string;
  educationProviderUserEmail?: string;
  educationProviderUserId?: number;
  educationProviderUserName?: string;
  offerCategories: OfferCategories;
  offerDescription?: string;
  offerId: number;
  offerLink?: string;
  offerLogo?: string;
  offerLongTitle?: string;
  offerResourcePk?: number;
  offerStatus?: string;
  offerTitle?: string;
  offerVersion?: number;
  schoolActivations?: string[];
  ['x-class-name']?: string;

  constructor(
    data: Omit<
      OfferItem,
      'convertClientIds' | 'clientId' | 'offerCategories'
    > & {
      clientId?: undefined | string | unknown[];
      offerCategories?: ConstructorParameters<typeof OfferCategories>[0];
    },
  ) {
    this.clientId = this.convertClientIds(data.clientId);
    this.educationProviderOrganizationId = data.educationProviderOrganizationId;
    this.educationProviderOrganizationName =
      data.educationProviderOrganizationName;
    this.educationProviderUserEmail = data.educationProviderUserEmail;
    this.educationProviderUserId = data.educationProviderUserId;
    this.educationProviderUserName = data.educationProviderUserName;
    this.offerCategories = new OfferCategories(data.offerCategories ?? {});
    this.offerDescription = data.offerDescription;
    this.offerId = data.offerId;
    this.offerLink = data.offerLink;
    this.offerLogo = data.offerLogo;
    this.offerLongTitle = data.offerLongTitle;
    this.offerResourcePk = data.offerResourcePk ?? 0;
    this.offerStatus = data.offerStatus;
    this.offerTitle = data.offerTitle;
    this.offerVersion = data.offerVersion ?? 0;
    this.schoolActivations = data.schoolActivations ?? [];
    this['x-class-name'] = data['x-class-name'];
  }

  private convertClientIds(
    rawClientIds: undefined | string | unknown[],
  ): string[] {
    try {
      if (Array.isArray(rawClientIds)) {
        return rawClientIds.filter(
          (id): id is string => typeof id === 'string',
        );
      } else if (typeof rawClientIds === 'string') {
        const parsed: unknown = JSON.parse(rawClientIds);
        return Array.isArray(parsed)
          ? parsed.filter((id): id is string => typeof id === 'string')
          : [];
      } else {
        return [];
      }
    } catch {
      return [];
    }
  }
}
