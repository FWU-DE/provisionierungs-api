import { getSession } from '@/lib/session';
import { SessionNotFoundException } from '@/lib/user/session-not-found-exception';
import {
  clearUserSchoolSelection,
  getUserFromSession,
  getUserSchoolSelection,
} from '@/lib/user/user';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { defaultLocale, locales } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localizedUri = (uri: string) => {
    const [, locale] = pathname.split('/');
    return `/${locale}${uri}`;
  };

  // Check if a valid session exists and redirect to log in if not
  if (null === (await getSession()) && !/^\/(de)?$/.exec(request.nextUrl.pathname)) {
    return redirectToLogin(request);
  }

  // Check if there is user data available
  let user;
  try {
    user = await getUserFromSession();
  } catch (error) {
    if (error instanceof SessionNotFoundException) {
      return redirectToLogin(request);
    }

    return redirectToLogout(request);
  }

  // Check if the user has multiple schools and force a selection of one

  if (user.schulkennung.length === 0 && pathname !== localizedUri('/user/no-school-available')) {
    return NextResponse.redirect(new URL(localizedUri('/user/no-school-available'), request.url));
  }
  if (user.schulkennung.length > 1 && pathname !== localizedUri('/user/select-school')) {
    const selection = await getUserSchoolSelection();
    if (!selection || !user.schulkennung.includes(selection)) {
      await clearUserSchoolSelection();
      return NextResponse.redirect(new URL(localizedUri('/user/select-school'), request.url));
    }
  }

  return intlMiddleware(request);
}

function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/login', request.url));
}

function redirectToLogout(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/logout', request.url));
}

export const config = {
  matcher: ['/((?!_next/|api/).*)'],
};
