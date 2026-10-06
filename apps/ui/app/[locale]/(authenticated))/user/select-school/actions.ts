'use server';

import { redirect } from '@/lib/navigation';
import { setUserSchoolSelection } from '@/lib/user/user';
import { revalidatePath } from 'next/cache';

import type { locales } from '../../../../../i18n/consts';

export async function selectSchool(locale: (typeof locales)[number], formData: FormData) {
  const schoolId = formData.get('schoolId') as string;
  if (schoolId) {
    await setUserSchoolSelection(schoolId);
    revalidatePath('/', 'layout');
    redirect({ href: '/apps', locale });
  }
}
