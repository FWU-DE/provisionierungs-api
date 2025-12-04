import AccessTokenCopyBox from '@/components/access-token-copy-box';
import { graphql } from '@/lib/gql-tada/graphql';
import { getGrahpqlClient } from '@/lib/graphql-client';
import { verifySession } from '@/lib/session';
import { getTranslations } from 'next-intl/server';

const query = graphql(`
  query Home {
    allClearances {
      idmId
      schoolId
    }
  }
`);

export default async function Home() {
  const t = await getTranslations('home');
  const session = await verifySession();
  const result = await getGrahpqlClient().query({ query });

  return (
    <div>
      <h1>{t('welcome')}</h1>
      Here you should be logged in
      <pre className="w-full overflow-x-scroll">{JSON.stringify(session, undefined, '  ')}</pre>
      <AccessTokenCopyBox token={session.accessToken} />
      <pre>{JSON.stringify(result)}</pre>
    </div>
  );
}
