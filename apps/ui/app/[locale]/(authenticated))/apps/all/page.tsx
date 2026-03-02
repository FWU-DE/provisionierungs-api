import { AppList, AppListSkeleton } from '@/components/pattern/app/list/app-list';
import { Headline } from '@/components/ui/headline';
import { fetchAllOffers, mapOffers } from '@/lib/graphql/offer-repository';
import type { Offer } from '@/lib/model/offer';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

export default async function AppsAll() {
  const t = await getTranslations('page/apps/all');

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
  const { data: allOffersResponse, error: allOffersError } = await fetchAllOffers();
  if (allOffersError) {
    // @todo: Yield an error message...
  }
  const allOffers = mapOffers(allOffersResponse?.allOffers);
  void allOffers;

  // @todo: Fetch all Clearance entries.
  // @todo: Add clearance information to offers / AppList.
  // @todo: Use real data!

  const mockOffers: Offer[] = [
    {
      educationProviderOrganizationName: 'EduTech Solutions',
      offerId: 1,
      offerTitle: 'Mathematics Mastery',
      offerLongTitle: 'Advanced Mathematics for High School Students',
      offerDescription: 'A comprehensive guide to calculus and algebra.',
      offerLink: 'https://example.com/math',
      offerLogo: 'https://picsum.photos/seed/math/200',
    },
    {
      educationProviderOrganizationName: 'Science Hub',
      offerId: 2,
      offerTitle: 'Biology Basics',
      offerLongTitle: 'Introduction to Biological Sciences',
      offerDescription: 'Explore the world of living organisms.',
      offerLink: 'https://example.com/biology',
      offerLogo: 'https://picsum.photos/seed/biology/200',
    },
    {
      educationProviderOrganizationName: 'History Plus',
      offerId: 3,
      offerTitle: 'World History',
      offerLongTitle: 'Chronicles of Human Civilization',
      offerDescription: 'From ancient times to the modern era.',
      offerLink: 'https://example.com/history',
      offerLogo: 'https://picsum.photos/seed/history/200',
    },
    {
      educationProviderOrganizationName: 'Language Lab',
      offerId: 4,
      offerTitle: 'Spanish Immersion',
      offerLongTitle: 'Fluent Spanish in 30 Days',
      offerDescription: 'Interactive lessons for quick learning.',
      offerLink: 'https://example.com/spanish',
      offerLogo: 'https://picsum.photos/seed/spanish/200',
    },
    {
      educationProviderOrganizationName: 'Art Academy',
      offerId: 5,
      offerTitle: 'Digital Painting',
      offerLongTitle: 'Mastering Digital Art Techniques',
      offerDescription: 'Unlock your creativity with digital tools.',
      offerLink: 'https://example.com/art',
      offerLogo: 'https://picsum.photos/seed/art/200',
    },
    {
      educationProviderOrganizationName: 'Code Camp',
      offerId: 6,
      offerTitle: 'Python for Beginners',
      offerLongTitle: 'Coding Essentials with Python',
      offerDescription: 'Learn the most popular programming language.',
      offerLink: 'https://example.com/python',
      offerLogo: 'https://picsum.photos/seed/python/200',
    },
    {
      educationProviderOrganizationName: 'Music Maestro',
      offerId: 7,
      offerTitle: 'Piano Fundamentals',
      offerLongTitle: 'Beginner to Intermediate Piano Lessons',
      offerDescription: 'Master the keys with our structured course.',
      offerLink: 'https://example.com/music',
      offerLogo: 'https://picsum.photos/seed/music/200',
    },
    {
      educationProviderOrganizationName: 'Physics World',
      offerId: 8,
      offerTitle: 'Quantum Physics',
      offerLongTitle: 'Deep Dive into Quantum Mechanics',
      offerDescription: 'Understanding the subatomic universe.',
      offerLink: 'https://example.com/physics',
      offerLogo: 'https://picsum.photos/seed/physics/200',
    },
    {
      educationProviderOrganizationName: 'Finance Guru',
      offerId: 9,
      offerTitle: 'Personal Finance',
      offerLongTitle: 'Managing Your Wealth Effectively',
      offerDescription: 'Budgeting, saving, and investing made easy.',
      offerLink: 'https://example.com/finance',
      offerLogo: 'https://picsum.photos/seed/finance/200',
    },
    {
      educationProviderOrganizationName: 'Eco Warriors',
      offerId: 10,
      offerTitle: 'Sustainable Living',
      offerLongTitle: 'Practical Steps for a Greener Life',
      offerDescription: 'Reduce your carbon footprint today.',
      offerLink: 'https://example.com/eco',
      offerLogo: 'https://picsum.photos/seed/eco/200',
    },
  ];

  return <AppList headline={'All used apps'} offers={mockOffers} />;
}
