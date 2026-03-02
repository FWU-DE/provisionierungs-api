import { Headline } from '@/components/ui/headline';
import { getTranslations } from 'next-intl/server';

export default async function NoSchoolAvailable() {
  const t = await getTranslations('page/user/no-school-available');

  // @todo: Show this page if the user has no school assigned.

  return (
    <div>
      <Headline headline={t('headline')} />

      {t('no_school_available_for_management')}
    </div>
  );
}
