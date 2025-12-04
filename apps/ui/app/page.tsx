import { redirect } from 'next/navigation';

import { defaultLocale } from '../i18n';

// This page only renders when the user accesses the root path '/'
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
