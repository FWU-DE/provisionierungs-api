import { graphql } from '@/lib/gql-tada/graphql';
import { getGrahpqlClient } from '@/lib/graphql-client';
import { type Offer, OffersSchema } from '@/lib/model/offer';

const queryAllOffers = graphql(`
  query AllOffers {
    allOffers {
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

export const fetchAllOffers = () => getGrahpqlClient().query({ query: queryAllOffers });

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

export const fetchOwnOffers = () => {
  // @todo: Fetch all Clearance entries.
  // @todo: Filter for clearance.

  return fetchAllOffers();
};
