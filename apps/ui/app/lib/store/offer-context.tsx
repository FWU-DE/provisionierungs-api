'use client';

import type { Offer } from '@/lib/model/offer';
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

interface OfferContextType {
  offers: Offer[] | null;
  setOffers: (offers: Offer[]) => void;
}

const OfferContext = createContext<OfferContextType | undefined>(undefined);

// @todo: Remove if no longer needed!

export const OfferProvider = ({
  children,
  initialOffers = [],
}: {
  children: ReactNode;
  initialOffers?: Offer[] | null;
}) => {
  const [offers, setOffers] = useState<Offer[] | null>(initialOffers);

  return (
    <OfferContext.Provider value={{ offers: offers, setOffers: setOffers }}>
      {children}
    </OfferContext.Provider>
  );
};

export const useOffer = () => {
  const context = useContext(OfferContext);
  if (!context) throw new Error('useOffer must be used within OfferProvider');
  return context;
};
