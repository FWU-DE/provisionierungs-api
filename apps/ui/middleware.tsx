import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getSession } from './app/lib/session';
import { defaultLocale, locales } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export async function middleware(request: NextRequest) {
  if (null === (await getSession())) {
    return NextResponse.redirect(new URL('/api/login', request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next/|api/).*)'],
};
