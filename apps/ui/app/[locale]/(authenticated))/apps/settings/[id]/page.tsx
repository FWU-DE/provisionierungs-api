import {
  OfferSettings,
  OfferSettingsSkeleton,
} from '@/components/pattern/offer/settings/offer-settings';
import ToastTrigger from '@/components/toast-trigger';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Headline } from '@/components/ui/headline';
import {
  fetchAllGroupClearances,
  fetchCreateGroupClearance,
  fetchDeleteAllGroupClearances,
  mapGroupClearances,
} from '@/lib/graphql/group-clearance-repository';
import { fetchAllGroups, mapGroups } from '@/lib/graphql/group-repository';
import { fetchOffer, mapOffer } from '@/lib/graphql/offer-repository';
import {
  fetchAllSchoolClearances,
  fetchCreateSchoolClearance,
  fetchDeleteSchoolClearance,
  mapSchoolClearances,
} from '@/lib/graphql/school-clearance-repository';
import type { User } from '@/lib/model/user';
import { Link } from '@/lib/navigation';
import { verifySession } from '@/lib/session';
import { getUserFromSession, getUserSchoolSelection } from '@/lib/user/user';
import { SearchX } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { Suspense } from 'react';

interface OfferDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OfferDetails({ params }: OfferDetailsProps) {
  const { id } = await params;
  const t = await getTranslations('page/apps/settings');
  const offerId = parseInt(id);

  async function deleteSchoolClearance(offerId: number, idmId: string, schoolId: string) {
    'use server';

    // Delete existing school clearance for this offer/user/school if present
    const { data: allSchoolClearanceResponse, error: allSchoolClearanceError } =
      await fetchAllSchoolClearances(offerId, schoolId);
    if (allSchoolClearanceError) {
      throw new Error(allSchoolClearanceError.message);
    }
    const allSchoolClearances = mapSchoolClearances(
      allSchoolClearanceResponse?.allSchoolClearances,
    );
    const ownSchoolClearances = allSchoolClearances.filter(
      (c) => c.idmId === idmId && c.schoolId === schoolId && c.offerId === offerId,
    );
    for (const sc of ownSchoolClearances) {
      if (sc.id) {
        await fetchDeleteSchoolClearance(sc.id);
      }
    }
  }

  async function saveOfferSettingsAction(formData: FormData) {
    'use server';
    const clearanceMode = formData.get('clearanceMode');
    const selectedGroupIds = formData.getAll('selectedGroupIds') as string[];

    const session = await verifySession();
    const schoolId = await getUserSchoolSelection();

    try {
      if (session?.isAuth && schoolId) {
        const user: User = await getUserFromSession();
        const idmId = user.heimatorganisation;

        // Delete all GroupClearance entries to set them freshly
        await fetchDeleteAllGroupClearances(idmId, offerId, schoolId);

        // Create group clearances for all selected IDs
        for (const groupId of selectedGroupIds) {
          await fetchCreateGroupClearance(offerId, groupId, idmId, schoolId);
        }

        // School clearance handling:
        // Create a SchoolClearance entry
        if (clearanceMode === 'school') {
          await fetchCreateSchoolClearance(offerId, idmId, schoolId);
        } else {
          await deleteSchoolClearance(offerId, idmId, schoolId);
        }
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }

    revalidatePath(`/apps/settings/${id}`);
    return { success: true };
  }

  async function deleteOfferSettingsAction() {
    'use server';

    const user: User = await getUserFromSession();
    const idmId = user.heimatorganisation;
    const schoolId = await getUserSchoolSelection();

    try {
      if (schoolId) {
        await fetchDeleteAllGroupClearances(idmId, offerId, schoolId);
        await deleteSchoolClearance(offerId, idmId, schoolId);
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }

    revalidatePath(`/apps/settings/${id}`);
    return { success: true };
  }

  return (
    <section>
      <Headline headline={t('headline')} />
      <Suspense fallback={<OfferSettingsSkeleton />}>
        <OfferSettingsDataWrapper
          offerId={offerId}
          saveAction={saveOfferSettingsAction}
          deleteAction={deleteOfferSettingsAction}
        />
      </Suspense>
    </section>
  );
}

interface OfferSettingsDataWrapperProps {
  offerId: number;
  saveAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  deleteAction: () => Promise<{ success: boolean; error?: string }>;
}

async function OfferSettingsDataWrapper({
  offerId,
  saveAction,
  deleteAction,
}: OfferSettingsDataWrapperProps) {
  const t = await getTranslations('page/apps/settings');

  // User-related information
  const user: User = await getUserFromSession();
  const idmId = user.heimatorganisation;
  const schoolId = await getUserSchoolSelection();

  // Offer
  const offerResponse = await fetchOffer(offerId, schoolId);
  const offer = mapOffer(offerResponse.data?.offer);

  if (!offer) {
    return (
      <section className="flex flex-col items-center justify-center py-12">
        <Alert variant="default" className="flex max-w-md flex-col items-center gap-4 text-center">
          <SearchX className="size-12! text-muted-foreground" />
          <AlertTitle className="text-xl font-bold">{t('not-found.headline')}</AlertTitle>
          <AlertDescription className="text-base">{t('not-found.description')}</AlertDescription>
          <Button asChild className="mt-4">
            <Link href="/apps">{t('back-to-apps')}</Link>
          </Button>
        </Alert>
      </section>
    );
  }

  // Groups
  const { data: allGroupsResponse, error: allGroupsError } = await fetchAllGroups(schoolId);
  const allGroups = mapGroups(allGroupsResponse?.allGroups);

  // GroupClearance
  const { data: allGroupClearancesResponse, error: allGroupClearancesError } =
    await fetchAllGroupClearances(offerId, schoolId);
  const allGroupClearances = mapGroupClearances(allGroupClearancesResponse?.allGroupClearances);

  // SchoolClearance
  const { data: allSchoolClearancesResponse, error: allSchoolClearancesError } =
    await fetchAllSchoolClearances(offerId, schoolId);
  const hasSchoolClearance = mapSchoolClearances(
    allSchoolClearancesResponse?.allSchoolClearances,
  ).some((sc) => sc.idmId === idmId && sc.schoolId === schoolId && sc.offerId === offerId);

  return (
    <>
      {allGroupsError && <ToastTrigger message={allGroupsError.message} type="error" />}
      {allGroupClearancesError && (
        <ToastTrigger message={allGroupClearancesError.message} type="error" />
      )}
      {allSchoolClearancesError && (
        <ToastTrigger message={allSchoolClearancesError.message} type="error" />
      )}
      <OfferSettings
        offer={offer}
        availableGroups={allGroups}
        clearanceEntries={allGroupClearances}
        hasSchoolClearance={hasSchoolClearance}
        backRoute="/apps"
        saveAction={saveAction}
        deleteAction={deleteAction}
      />
    </>
  );
}
