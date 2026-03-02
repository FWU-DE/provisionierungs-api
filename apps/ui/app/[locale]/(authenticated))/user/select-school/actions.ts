'use server';

import { setUserSchoolSelection } from '@/lib/user/user';
import { getLocale } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function selectSchool(formData: FormData) {
  const schoolId = formData.get('schoolId') as string;
  if (schoolId) {
    await setUserSchoolSelection(schoolId);
    revalidatePath('/', 'layout');
    const locale = await getLocale();
    redirect(`/${locale as string}/home`);
  }
}
