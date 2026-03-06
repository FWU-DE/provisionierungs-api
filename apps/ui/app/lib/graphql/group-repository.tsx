import { graphql } from '@/lib/gql-tada/graphql';
import { getGrahpqlClient } from '@/lib/graphql-client';
import { type Group, GroupsSchema } from '@/lib/model/group';

const queryAllGroups = graphql(`
  query AllGroups($schoolId: String) {
    allGroups(schoolId: $schoolId) {
      id
      name
    }
  }
`);

// Query response schema
export interface AllGroupsQuery {
  allGroups: {
    id: string;
    name: string | null;
  }[];
}

export const fetchAllGroups = (schoolId?: string) => {
  return getGrahpqlClient().query({
    query: queryAllGroups,
    variables: { schoolId },
  });
};

export function mapGroups(gqlGroups: AllGroupsQuery['allGroups'] | undefined): Group[] {
  return GroupsSchema.parse(
    gqlGroups?.map((group) => ({
      id: group.id,
      name: group.name ?? undefined,
    })),
  );
}
