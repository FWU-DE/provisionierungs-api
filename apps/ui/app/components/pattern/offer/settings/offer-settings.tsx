'use client';

import * as React from 'react';
import { GroupList } from '@/components/pattern/group-list';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Headline } from '@/components/ui/headline';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import type { Group } from '@/lib/model/group';
import type { GroupClearance } from '@/lib/model/group-clearance';
import type { Offer } from '@/lib/model/offer';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  BookIcon,
  PlusIcon,
  SchoolIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo, useTransition } from 'react';
import { toast } from 'sonner';

interface OfferSettingsProps {
  offer: Offer;
  availableGroups: Group[];
  clearanceEntries?: GroupClearance[];
  hasSchoolClearance?: boolean;
  backRoute?: string;
  saveAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  deleteAction: () => Promise<{ success: boolean; error?: string }>;
}

interface TabItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}

type ClearanceMode = 'groups' | 'school';

function TabItem({ active, onClick, icon: Icon, label }: TabItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-1/3 cursor-pointer flex-col items-center gap-2 rounded-lg border border-gray-300 px-6 py-4 text-lg font-medium transition-colors',
        active ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="size-8" />
      {label}
    </button>
  );
}

export function OfferSettingsSkeleton() {
  return (
    <div className="relative min-h-screen pb-24">
      {/* Header-Box Skeleton */}
      <div className="mb-8 flex flex-col gap-4">
        <Skeleton className="h-4 w-20" /> {/* Back button */}
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-lg" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
      </div>

      {/* Main Area Skeleton */}
      <div className="relative flex flex-col gap-8">
        <div>
          <Skeleton className="mb-2 h-10 w-48" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>

        {/* Tab-Navigation Skeleton */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-20 w-1/3 rounded-lg" />
            <Skeleton className="h-20 w-1/3 rounded-lg" />
          </div>

          <div className="flex gap-4 md:flex-row">
            <Skeleton className="h-96 rounded-2xl md:w-1/2" />
            <Skeleton className="h-96 rounded-2xl md:w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function OfferSettings({
  offer,
  availableGroups,
  clearanceEntries,
  backRoute,
  hasSchoolClearance,
  saveAction,
  deleteAction,
}: OfferSettingsProps) {
  const t = useTranslations('component/offer-settings');

  const initialClearanceMode: ClearanceMode = hasSchoolClearance ? 'school' : 'groups';
  const [activeTab, setActiveTab] = React.useState<ClearanceMode>(initialClearanceMode);
  const [isPending, startTransition] = useTransition();

  const isUnconfigured = (clearanceEntries?.length ?? 0) === 0 && !hasSchoolClearance;
  const [isOverlayVisible, setIsOverlayVisible] = React.useState(isUnconfigured);

  const initialSelectedGroupIds = React.useMemo(
    () => new Set(clearanceEntries?.map((entry) => entry.groupId) ?? []),
    [clearanceEntries],
  );

  const [selectedGroupIds, setSelectedGroupIds] =
    React.useState<Set<string>>(initialSelectedGroupIds);

  React.useEffect(() => {
    setSelectedGroupIds(initialSelectedGroupIds);
  }, [initialSelectedGroupIds]);

  const hasChanges = React.useMemo(() => {
    if (activeTab !== initialClearanceMode) return true;
    if (selectedGroupIds.size !== initialSelectedGroupIds.size) return true;
    for (const id of selectedGroupIds) {
      if (!initialSelectedGroupIds.has(id)) return true;
    }
    return false;
  }, [activeTab, initialClearanceMode, selectedGroupIds, initialSelectedGroupIds]);

  const isSaveAllowed = React.useMemo(() => {
    return activeTab === 'school' || selectedGroupIds.size > 0;
  }, [activeTab, selectedGroupIds]);

  const handleCancel = () => {
    setActiveTab(initialClearanceMode);
    setSelectedGroupIds(initialSelectedGroupIds);
  };

  const selectedGroups = useMemo(() => {
    return availableGroups.filter((group) => selectedGroupIds.has(group.id));
  }, [availableGroups, selectedGroupIds]);

  const notSelectedGroups = useMemo(() => {
    return availableGroups.filter((group) => !selectedGroupIds.has(group.id));
  }, [availableGroups, selectedGroupIds]);

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleSave = (formData: FormData) => {
    startTransition(async () => {
      const result = await saveAction(formData);
      if (result.success) {
        toast.success(t('saved'));
      } else {
        toast.error(result.error ?? t('error-saving'));
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAction();
      if (result.success) {
        toast.success(t('deleted'));
        setIsOverlayVisible(true);
      } else {
        toast.error(result.error ?? t('error-deleting'));
      }
    });
  };

  return (
    <div className="relative min-h-screen pb-24">
      {/* Header-Box */}
      <div className="mb-8 flex flex-col gap-4">
        {backRoute && (
          <Button variant="ghost" size="sm" className="w-fit p-0" asChild>
            <Link href={backRoute}>
              <ArrowLeftIcon className="mr-2 size-4" />
              <span>{t('back')}</span>
            </Link>
          </Button>
        )}

        <div className="flex items-center gap-4">
          <div className="bg-muted size-16 overflow-hidden rounded-lg border">
            {offer.offerLogo ? (
              <Image
                className={'size-full object-cover'}
                src={offer.offerLogo}
                width={128}
                height={128}
                alt={offer.offerTitle}
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <BookIcon className="text-muted-foreground size-8" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">{offer.offerTitle}</h1>
            {/*<p className="text-muted-foreground text-sm">Freigabe erteilt am {createdAt}</p>*/}
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="relative flex flex-col gap-8">
        {isOverlayVisible && (
          <div className="bg-primary/50 absolute inset-0 z-20 flex items-center justify-center rounded-2xl backdrop-blur-sm">
            <div className="flex flex-col items-center rounded-2xl bg-white p-12 text-center shadow-xl">
              <h2 className="mb-2 text-2xl font-bold">{t('empty-headline')}</h2>
              <p className="text-muted-foreground mb-8 max-w-xs">{t('empty-copy')}</p>
              <Button
                onClick={() => {
                  setIsOverlayVisible(false);
                }}
                size="lg"
                className="flex items-center gap-2"
              >
                {t('empty-button')}
                <PlusIcon className="size-5" />
              </Button>
            </div>
          </div>
        )}

        <div>
          <Headline headline={t('headline')} tag="h2" size="h2" className="mb-1" />
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        {/* Tab-Navigation */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <TabItem
              active={activeTab === 'groups'}
              onClick={() => {
                setActiveTab('groups');
              }}
              icon={UsersIcon}
              label={t('tab-groups')}
            />
            <TabItem
              active={activeTab === 'school'}
              onClick={() => {
                setActiveTab('school');
              }}
              icon={SchoolIcon}
              label={t('tab-school')}
            />
          </div>

          {activeTab === 'groups' && (
            <div className="flex gap-4 md:flex-row" data-testid="group-list">
              <GroupList
                className="rounded-2xl bg-gray-50 px-4 pb-4 pt-2 shadow-lg md:w-1/2"
                headline={t('available-groups')}
                groups={notSelectedGroups}
                onClickGroup={toggleGroup}
                isSearchable
              />
              <GroupList
                className="rounded-2xl bg-gray-200 px-4 pb-4 pt-2 md:w-1/2"
                headline={t('selected-groups')}
                groups={selectedGroups}
                onClickGroup={toggleGroup}
              />
            </div>
          )}

          {activeTab === 'school' && (
            <div className="mt-4 rounded-lg border p-6">
              <p className="text-center text-sm font-semibold">{t('school-release-granted')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Warning for missing groups */}
      {!isOverlayVisible && activeTab === 'groups' && selectedGroups.length === 0 && (
        <Alert variant="destructive" className="mt-8">
          <AlertCircleIcon className="translate-0! size-4" />
          <AlertDescription className="text-lg font-semibold">
            {t('please-select-at-least-one-group')}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Bar */}
      {!isOverlayVisible && (!isUnconfigured || hasChanges) && (
        <div className="bg-background sticky bottom-8 mt-6 flex items-center justify-end gap-3 rounded-lg border p-4 shadow-lg">
          {!isUnconfigured && (
            <form action={handleDelete} className="mr-auto">
              <Button
                type="submit"
                variant="destructive"
                className="flex items-center gap-2"
                disabled={isPending}
              >
                {t('remove-configuration')}
                {isPending ? <Spinner /> : <Trash2Icon className="size-4" />}
              </Button>
            </form>
          )}

          {hasChanges && (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isPending}>
                {t('cancel')}
              </Button>
              <form action={handleSave}>
                <input type="hidden" name="clearanceMode" value={activeTab} />
                {Array.from(selectedGroupIds).map((id) => (
                  <input key={id} type="hidden" name="selectedGroupIds" value={id} />
                ))}
                <Button type="submit" variant="default" disabled={!isSaveAllowed || isPending}>
                  <div className="flex items-center gap-2">
                    {t('save')}
                    {isPending && <Spinner />}
                  </div>
                </Button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
