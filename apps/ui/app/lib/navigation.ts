import { createNavigation } from 'next-intl/navigation';

import { locales } from '../../i18n/consts';

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
});
