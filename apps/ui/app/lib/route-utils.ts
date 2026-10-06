'use client';

import { usePathname } from '@/lib/navigation';

export function isActiveRoute(pathname: string, route: string) {
  const normalizedRoute = route.startsWith('/') ? route : '/' + route;
  return (
    pathname === normalizedRoute ||
    (pathname.startsWith(normalizedRoute) && pathname.charAt(normalizedRoute.length) === '/')
  );
}

export function useActiveRoute(route: string) {
  const pathname = usePathname();

  return isActiveRoute(pathname, route);
}
