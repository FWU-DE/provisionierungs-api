import { defineRouting } from 'next-intl/routing';

import { defaultLocale, locales } from './consts';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
});
