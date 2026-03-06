'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export function isActiveRoute(pathname: string, locale: string, route: string) {
  const normalizedRoute = `/${locale}${route.startsWith('/') ? route : '/' + route}`;
  return (
    pathname === normalizedRoute ||
    (pathname.startsWith(normalizedRoute) && pathname.charAt(normalizedRoute.length) === '/')
  );
}

export function useActiveRoute(route: string) {
  const pathname = usePathname();
  const locale = useLocale();

  return isActiveRoute(pathname, locale, route);
}
