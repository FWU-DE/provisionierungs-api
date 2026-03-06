'use client';

import * as React from 'react';
import { Sidebar } from '@/components/ui/sidebar/sidebar';
import { SidebarItem } from '@/components/ui/sidebar/sidebar-item';
import { LayersIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

function SidebarMain() {
  const t = useTranslations('component/sidebar/main');

  // Define sidebar items
  const sidebarItems = [
    {
      label: t('apps-own'),
      icon: LayersIcon,
      href: '/apps',
    },
  ];

  return (
    <Sidebar>
      {sidebarItems.map((item) => (
        <SidebarItem key={item.label} {...item} />
      ))}
    </Sidebar>
  );
}

export { SidebarMain };
