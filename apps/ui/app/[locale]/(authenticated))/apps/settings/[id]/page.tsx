import { AppSettings } from '@/components/pattern/app/settings/app-settings';
import { Headline } from '@/components/ui/headline';
import { getTranslations } from 'next-intl/server';

interface AppDetailsProps {
  params: {
    id: string;
  };
}

export default async function AppDetails({ params }: AppDetailsProps) {
  const t = await getTranslations('page/apps/settings');

  // @todo: Check if app actually exists.
  // @todo: Check if app is accessible by user.
  // @todo: Fetch clearance for app.
  // @todo: Allow to add clearance for app.
  // @todo: Allow to revoke/delete clearance for app.

  return (
    <div>
      <Headline headline={t('headline')} />
      <AppSettings appName={'App ' + params.id} createdAt={String(Date.now())} />
    </div>
  );
}
