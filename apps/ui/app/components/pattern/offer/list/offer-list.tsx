'use client';

import * as React from 'react';
import {
  OfferCard,
  type OfferCardProps,
  OfferCardSkeleton,
} from '@/components/pattern/card/offer-card';
import { Headline } from '@/components/ui/headline';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

export interface OfferListProps {
  headline?: string;
  subline?: string;
  items?: OfferCardProps[];
}

export function OfferListSkeleton() {
  return (
    <div>
      <div className="mb-4">
        <Skeleton className="mb-1 h-7 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <ul className="mb-10 mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3" role="list">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i}>
            <OfferCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OfferList({
  headline,
  subline,
  items = [],
  className,
  ...props
}: React.ComponentProps<'div'> & OfferListProps) {
  const t = useTranslations('component/offer-list');

  return (
    <div className={className} {...props}>
      {headline && (
        <Headline
          tag="h3"
          size="h4"
          headline={headline}
          subline={subline}
          sublineSize="h6"
          sublineClassName="text-gray-600"
        />
      )}

      <ul
        className="mb-10 mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3"
        role="list"
        aria-label="Apps"
      >
        {items.length === 0 && <p>{t('no-offers')}</p>}
        {items.map((item: OfferCardProps) => (
          <li key={item.offerId}>
            <OfferCard className="h-full" {...item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
