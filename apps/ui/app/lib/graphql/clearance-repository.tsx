import { graphql } from '@/lib/gql-tada/graphql';
import { getGrahpqlClient } from '@/lib/graphql-client';

// @todo: Create schema & DTO (s. Offer)!

const queryAllClearance = graphql(`
  query Clearance {
    allClearances {
      idmId
      schoolId
    }
  }
`);
export const fetchAllClearance = () => getGrahpqlClient().query({ query: queryAllClearance });

const mutationCreateClearance = graphql(`
  mutation CreateClearance($offerId: Int!, $idmId: String!, $groupId: String!, $schoolId: String!) {
    createClearance(offerId: $offerId, idmId: $idmId, groupId: $groupId, schoolId: $schoolId) {
      offerId
      idmId
      groupId
      schoolId
    }
  }
`);
export const fetchCreateClearance = (
  offerId: number,
  groupId: string,
  idmId: string,
  schoolId: string,
) =>
  getGrahpqlClient().mutate({
    mutation: mutationCreateClearance,
    variables: { offerId, idmId, groupId, schoolId },
  });

const mutationDeleteClearance = graphql(`
  mutation DeleteClearance($id: String!) {
    deleteClearance(id: $id) {
      deleted
    }
  }
`);
export const fetchDeleteClearance = (clearanceId: string) =>
  getGrahpqlClient().mutate({
    mutation: mutationDeleteClearance,
    variables: { id: clearanceId },
  });
