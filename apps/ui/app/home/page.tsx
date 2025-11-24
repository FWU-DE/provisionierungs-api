import AccessTokenCopyBox from '../components/access-token-copy-box';
import { graphql } from '../lib/gql-tada/graphql';
import { getGrahpqlClient } from '../lib/graphql-client';
import { verifySession } from '../lib/session';

const query = graphql(`
  query Home {
    allClearances {
      idmId
      schoolId
    }
  }
`);

export default async function Home() {
  const session = await verifySession();
  const result = await getGrahpqlClient().query({ query });

  return (
    <div>
      Here you should be logged in<pre>{JSON.stringify(session)}</pre>
      <AccessTokenCopyBox token={session.accessToken} />
      <pre>{JSON.stringify(result)}</pre>
    </div>
  );
}
