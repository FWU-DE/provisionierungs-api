import * as rootParams from 'next/root-params';
import { getRequestConfig } from 'next-intl/server';

import { type Locale, defaultLocale, locales } from './consts';

export default getRequestConfig(async () => {
  // This typically corresponds to the `[locale]` segment
  let locale = await rootParams.locale();

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale: locale as Locale,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
