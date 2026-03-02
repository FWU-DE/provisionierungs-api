'use client';

import * as React from 'react';
import { Sidebar } from '@/components/ui/sidebar/sidebar';
import { SidebarItem } from '@/components/ui/sidebar/sidebar-item';
import { GraduationCapIcon, HomeIcon, LayersIcon } from 'lucide-react';

function SidebarMain() {
  // Define sidebar items
  // @todo: Translate!
  const sidebarItems = [
    {
      label: 'Home',
      icon: HomeIcon,
      href: '/home',
    },
    {
      label: 'Cleared apps',
      icon: LayersIcon,
      href: '/apps/own',
    },
    {
      label: 'All apps',
      icon: GraduationCapIcon,
      href: '/apps/all',
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
