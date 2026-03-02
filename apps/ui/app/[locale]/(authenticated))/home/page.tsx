import AccessTokenCopyBox from '@/components/access-token-copy-box';
import { Headline } from '@/components/ui/headline';
import { verifySession } from '@/lib/session';
import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations('page/home');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const session = (await verifySession())!;

  // @todo: Remove after implementation!
  const showJWT = false;

  return (
    <div>
      <Headline headline={t('headline')} />

      <p>Here you should be logged in</p>

      {/*<pre className="w-full overflow-x-scroll">{JSON.stringify(session, undefined, '  ')}</pre>*/}

      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {showJWT && <AccessTokenCopyBox token={session.accessToken} />}
    </div>
  );
}
