import { graphql } from '@/lib/gql-tada/graphql';
import { getGrahpqlClient } from '@/lib/graphql-client';
import { type SchoolClearance, SchoolClearancesSchema } from '@/lib/model/school-clearance';
import { ApolloClient } from '@apollo/client';

import QueryResult = ApolloClient.QueryResult;

const queryAllSchoolClearances = graphql(`
  query SchoolClearance($offerId: Int, $schoolId: String) {
    allSchoolClearances(offerId: $offerId, schoolId: $schoolId) {
      id
      offerId
      idmId
      schoolId
    }
  }
`);

// Query response schema
export interface AllSchoolClearancesQuery {
  allSchoolClearances: {
    id: string;
    offerId: number;
    idmId: string;
    schoolId: string;
  }[];
}

export const fetchAllSchoolClearances = (
  offerId?: number,
  schoolId?: string,
): Promise<QueryResult<AllSchoolClearancesQuery>> =>
  getGrahpqlClient().query({ query: queryAllSchoolClearances, variables: { offerId, schoolId } });

export function mapSchoolClearances(
  gqlSchoolClearances: AllSchoolClearancesQuery['allSchoolClearances'] | undefined,
): SchoolClearance[] {
  return SchoolClearancesSchema.parse(
    gqlSchoolClearances?.map((schoolClearance) => ({
      id: schoolClearance.id,
      offerId: schoolClearance.offerId,
      idmId: schoolClearance.idmId,
      schoolId: schoolClearance.schoolId,
    })),
  );
}

const mutationCreateSchoolClearance = graphql(`
  mutation CreateSchoolClearance($offerId: Int!, $idmId: String!, $schoolId: String!) {
    createSchoolClearance(offerId: $offerId, idmId: $idmId, schoolId: $schoolId) {
      offerId
      idmId
      schoolId
    }
  }
`);
export const fetchCreateSchoolClearance = (offerId: number, idmId: string, schoolId: string) =>
  getGrahpqlClient().mutate({
    mutation: mutationCreateSchoolClearance,
    variables: { offerId, idmId, schoolId },
  });

const mutationDeleteSchoolClearance = graphql(`
  mutation DeleteSchoolClearance($id: String!) {
    deleteSchoolClearance(id: $id) {
      deleted
    }
  }
`);
export const fetchDeleteSchoolClearance = (schoolClearanceId: string) =>
  getGrahpqlClient().mutate({
    mutation: mutationDeleteSchoolClearance,
    variables: { id: schoolClearanceId },
  });
