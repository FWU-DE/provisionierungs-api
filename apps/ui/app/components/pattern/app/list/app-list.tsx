'use client';

import * as React from 'react';
import { AppCard, AppCardSkeleton } from '@/components/pattern/card/app-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Offer } from '@/lib/model/offer';
import { useTranslations } from 'next-intl';

interface AppListProps {
  headline?: string;
  subline?: string;
  offers: Offer[];
}

export function AppListSkeleton() {
  return (
    <div>
      <Skeleton className="mb-1 h-7 w-48" />
      <Skeleton className="mb-4 h-5 w-64" />
      <ul className="mb-10 mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" role="list">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i}>
            <AppCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AppList({
  headline,
  subline,
  offers,
  className,
  ...props
}: React.ComponentProps<'div'> & AppListProps) {
  const t = useTranslations('component/app-list');

  return (
    <div className={className} {...props}>
      <h3 className={'mb-1 text-lg font-semibold'}>{headline ?? t('headline')}</h3>
      <div className={'mb-4 text-gray-600'}>{subline}</div>

      <ul
        className="mb-10 mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
        role="list"
        aria-label="Apps"
      >
        {offers.length === 0 && <p>{t('no-apps')}</p>}
        {offers.map((offer: Offer) => (
          <li key={offer.offerId}>
            <AppCard
              offerId={offer.offerId}
              publisher={offer.educationProviderOrganizationName}
              title={offer.offerTitle}
              titleLong={offer.offerLongTitle}
              description={offer.offerDescription}
              link={offer.offerLink}
              logo={offer.offerLogo}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
