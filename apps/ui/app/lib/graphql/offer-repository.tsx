import { graphql } from '@/lib/gql-tada/graphql';
import { getGrahpqlClient } from '@/lib/graphql-client';
import { type Offer, OffersSchema } from '@/lib/model/offer';

const queryAllOffers = graphql(`
  query AllOffers($schoolId: String) {
    allOffers(schoolId: $schoolId) {
      educationProviderOrganizationName
      offerId
      offerTitle
      offerLongTitle
      offerDescription
      offerLink
      offerLogo
    }
  }
`);

const queryOffer = graphql(`
  query Offer($id: Int!, $schoolId: String) {
    offer(id: $id, schoolId: $schoolId) {
      educationProviderOrganizationName
      offerId
      offerTitle
      offerLongTitle
      offerDescription
      offerLink
      offerLogo
    }
  }
`);

// Query response schema
export interface AllOffersQuery {
  allOffers: {
    educationProviderOrganizationName: string;
    offerId: number;
    offerTitle: string;
    offerLongTitle: string;
    offerDescription: string;
    offerLink: string;
    offerLogo: string;
  }[];
}

export interface OfferQuery {
  offer: {
    educationProviderOrganizationName: string;
    offerId: number;
    offerTitle: string;
    offerLongTitle: string;
    offerDescription: string;
    offerLink: string;
    offerLogo: string;
  } | null;
}

export const fetchAllOffers = (schoolId?: string) =>
  getGrahpqlClient().query({ query: queryAllOffers, variables: { schoolId } });

export const fetchOffer = (id: number, schoolId?: string) =>
  getGrahpqlClient().query({ query: queryOffer, variables: { id, schoolId } });

export function mapOffers(gqlOffers: AllOffersQuery['allOffers'] | undefined): Offer[] {
  return OffersSchema.parse(
    gqlOffers?.map((offer) => ({
      educationProviderOrganizationName: offer.educationProviderOrganizationName,
      offerId: offer.offerId,
      offerTitle: offer.offerTitle,
      offerLongTitle: offer.offerLongTitle,
      offerDescription: offer.offerDescription,
      offerLink: offer.offerLink,
      offerLogo: offer.offerLogo,
    })),
  );
}

export function mapOffer(gqlOffer: OfferQuery['offer'] | undefined): Offer | undefined {
  if (!gqlOffer) {
    return undefined;
  }

  return OffersSchema.element.parse({
    educationProviderOrganizationName: gqlOffer.educationProviderOrganizationName,
    offerId: gqlOffer.offerId,
    offerTitle: gqlOffer.offerTitle,
    offerLongTitle: gqlOffer.offerLongTitle,
    offerDescription: gqlOffer.offerDescription,
    offerLink: gqlOffer.offerLink,
    offerLogo: gqlOffer.offerLogo,
  });
}
