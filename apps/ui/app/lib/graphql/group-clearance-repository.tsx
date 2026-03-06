import { graphql } from '@/lib/gql-tada/graphql';
import { getGrahpqlClient } from '@/lib/graphql-client';
import { type GroupClearance, GroupClearancesSchema } from '@/lib/model/group-clearance';
import { ApolloClient } from '@apollo/client';

import QueryResult = ApolloClient.QueryResult;

const queryAllGroupClearances = graphql(`
  query GroupClearance($offerId: Int, $schoolId: String) {
    allGroupClearances(offerId: $offerId, schoolId: $schoolId) {
      id
      offerId
      idmId
      schoolId
      groupId
    }
  }
`);

// Query response schema
export interface AllGroupClearancesQuery {
  allGroupClearances: {
    id: string;
    offerId: number;
    idmId: string;
    schoolId: string;
    groupId: string;
  }[];
}

export const fetchAllGroupClearances = async (
  offerId?: number,
  schoolId?: string,
): Promise<QueryResult<AllGroupClearancesQuery>> =>
  getGrahpqlClient().query({
    query: queryAllGroupClearances,
    variables: { offerId, schoolId },
  });

export function mapGroupClearances(
  gqlGroupClearances: AllGroupClearancesQuery['allGroupClearances'] | undefined,
): GroupClearance[] {
  return GroupClearancesSchema.parse(
    gqlGroupClearances?.map((groupClearance) => ({
      id: groupClearance.id,
      offerId: groupClearance.offerId,
      idmId: groupClearance.idmId,
      schoolId: groupClearance.schoolId,
      groupId: groupClearance.groupId,
    })),
  );
}

const mutationCreateGroupClearance = graphql(`
  mutation CreateGroupClearance(
    $offerId: Int!
    $idmId: String!
    $groupId: String!
    $schoolId: String!
  ) {
    createGroupClearance(offerId: $offerId, idmId: $idmId, groupId: $groupId, schoolId: $schoolId) {
      offerId
      idmId
      groupId
      schoolId
    }
  }
`);
export const fetchCreateGroupClearance = (
  offerId: number,
  groupId: string,
  idmId: string,
  schoolId: string,
) =>
  getGrahpqlClient().mutate({
    mutation: mutationCreateGroupClearance,
    variables: { offerId, idmId, groupId, schoolId },
  });

const mutationDeleteGroupClearance = graphql(`
  mutation DeleteGroupClearance($id: String!) {
    deleteGroupClearance(id: $id) {
      deleted
    }
  }
`);
export const fetchDeleteGroupClearance = (groupClearanceId: string) =>
  getGrahpqlClient().mutate({
    mutation: mutationDeleteGroupClearance,
    variables: { id: groupClearanceId },
  });

const mutationDeleteAllGroupClearances = graphql(`
  mutation DeleteAllGroupClearance($offerId: Int!, $idmId: String!, $schoolId: String!) {
    deleteAllGroupClearances(offerId: $offerId, idmId: $idmId, schoolId: $schoolId) {
      deleted
    }
  }
`);
export const fetchDeleteAllGroupClearances = (idmId: string, offerId: number, schoolId: string) =>
  getGrahpqlClient().mutate({
    mutation: mutationDeleteAllGroupClearances,
    variables: { offerId, idmId, schoolId },
  });
