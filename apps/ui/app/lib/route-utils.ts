'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export function useActiveRoute(route: string) {
  const pathname = usePathname();
  const locale = useLocale();

  return pathname === `/${locale}${route.startsWith('/') ? route : '/' + route}`;
}
