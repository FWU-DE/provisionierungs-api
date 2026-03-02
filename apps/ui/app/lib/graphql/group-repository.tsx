import { graphql } from '@/lib/gql-tada/graphql';
import { getGrahpqlClient } from '@/lib/graphql-client';

// @todo: Create schema & DTO (s. Offer)!

const queryAllGroups = graphql(`
  query AllGroups {
    allGroups {
      id
      name
    }
  }
`);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const fetchAllGroups = () => getGrahpqlClient().query({ queryAllGroups });
