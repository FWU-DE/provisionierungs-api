import type { OfferCardProps } from '@/components/pattern/card/offer-card';
import { OfferList, OfferListSkeleton } from '@/components/pattern/offer/list/offer-list';
import ToastTrigger from '@/components/toast-trigger';
import { Headline } from '@/components/ui/headline';
import {
  fetchAllGroupClearances,
  mapGroupClearances,
} from '@/lib/graphql/group-clearance-repository';
import { fetchAllGroups, mapGroups } from '@/lib/graphql/group-repository';
import { fetchAllOffers, mapOffers } from '@/lib/graphql/offer-repository';
import {
  fetchAllSchoolClearances,
  mapSchoolClearances,
} from '@/lib/graphql/school-clearance-repository';
import type { Group } from '@/lib/model/group';
import type { GroupClearance } from '@/lib/model/group-clearance';
import type { Offer } from '@/lib/model/offer';
import type { SchoolClearance } from '@/lib/model/school-clearance';
import { getUserSchoolSelection } from '@/lib/user/user';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

export default async function AppsOwn() {
  const t = await getTranslations('page/apps');

  return (
    <section>
      <Headline headline={t('headline')} subline={t('subline')} />

      <Suspense fallback={<OfferListSkeleton />}>
        <OffersDataWrapper />
      </Suspense>
    </section>
  );
}

async function OffersDataWrapper() {
  const schoolId = await getUserSchoolSelection();

  // Offers
  const { data: allOffersResponse, error: allOffersError } = await fetchAllOffers(schoolId);
  if (allOffersError) {
    return <ToastTrigger message={allOffersError.message} type="error" />;
  }
  const allOffers = mapOffers(allOffersResponse?.allOffers);

  // Group clearances
  const { data: allGroupClearancesResponse, error: allGroupClearancesError } =
    await fetchAllGroupClearances(undefined, schoolId);
  if (allGroupClearancesError) {
    return <ToastTrigger message={allGroupClearancesError.message} type="error" />;
  }
  const allGroupClearances = mapGroupClearances(allGroupClearancesResponse?.allGroupClearances);

  // School clearances
  const { data: allSchoolClearancesResponse, error: allSchoolClearancesError } =
    await fetchAllSchoolClearances(undefined, schoolId);
  if (allSchoolClearancesError) {
    return <ToastTrigger message={allSchoolClearancesError.message} type="error" />;
  }
  const allSchoolClearances = mapSchoolClearances(allSchoolClearancesResponse?.allSchoolClearances);

  // Groups
  const { data: allGroupsResponse, error: allGroupsError } = await fetchAllGroups(schoolId);
  if (allGroupsError) {
    return <ToastTrigger message={allGroupsError.message} type="error" />;
  }
  const allGroups = mapGroups(allGroupsResponse?.allGroups);

  const offerCards = mapOffersToCardProps(
    allOffers,
    allGroupClearances,
    allSchoolClearances,
    allGroups,
  );

  return <OfferList items={offerCards} />;
}

function mapOffersToCardProps(
  offers: Offer[],
  groupClearances: GroupClearance[] = [],
  schoolClearances: SchoolClearance[] = [],
  groups: Group[] = [],
): OfferCardProps[] {
  const groupMap = new Map(groups.map((group) => [group.id, group.name]));

  return offers.map((offer) => ({
    offerId: offer.offerId,
    publisher: offer.educationProviderOrganizationName,
    title: offer.offerTitle,
    titleLong: offer.offerLongTitle,
    description: offer.offerDescription,
    logo: offer.offerLogo,
    link: offer.offerLink,
    groups: groupClearances
      .filter((clearance) => clearance.offerId === offer.offerId)
      .map((clearance) => groupMap.get(clearance.groupId))
      .filter((groupName): groupName is string => groupName !== undefined),
    schools: schoolClearances
      .filter((clearance) => clearance.offerId === offer.offerId)
      .map((clearance) => clearance.schoolId),
  }));
}
