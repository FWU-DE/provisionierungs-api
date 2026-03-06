import { Headline } from '@/components/ui/headline';
import { getTranslations } from 'next-intl/server';

export default async function NoSchoolAvailable() {
  const t = await getTranslations('page/user/no-school-available');

  return (
    <section>
      <Headline headline={t('headline')} />

      {t('no_school_available_for_management')}
    </section>
  );
}
