import { AppList, AppListSkeleton } from '@/components/pattern/app/list/app-list';
import { Headline } from '@/components/ui/headline';
import { fetchOwnOffers, mapOffers } from '@/lib/graphql/offer-repository';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

export default async function AppsOwn() {
  const t = await getTranslations('page/apps/own');

  return (
    <div>
      <Headline headline={t('headline')} />

      <Suspense fallback={<AppListSkeleton />}>
        <OffersDataWrapper />
      </Suspense>
    </div>
  );
}

async function OffersDataWrapper() {
  const { data: allOffersResponse, error: allOffersError } = await fetchOwnOffers();
  if (allOffersError) {
    // @todo: Yield an error message...
  }
  const allOffers = mapOffers(allOffersResponse?.allOffers);

  return <AppList headline={'All used apps'} offers={allOffers} />;
}
