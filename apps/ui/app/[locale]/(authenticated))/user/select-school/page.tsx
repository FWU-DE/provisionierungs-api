import * as React from 'react';
import { selectSchool } from '@/[locale]/(authenticated))/user/select-school/actions';
import { SchoolList } from '@/components/pattern/school-list';
import { Headline } from '@/components/ui/headline';
import type { User } from '@/lib/model/user';
import { getUserFromSession } from '@/lib/user/user';
import { getTranslations } from 'next-intl/server';

export default async function SelectSchool() {
  const t = await getTranslations('page/user/select-school');

  const user: User = await getUserFromSession();

  return (
    <div>
      <Headline headline={t('headline')} />

      <p>{t('select_school_to_administer')}</p>

      <SchoolList action={selectSchool} user={user} />
    </div>
  );
}
