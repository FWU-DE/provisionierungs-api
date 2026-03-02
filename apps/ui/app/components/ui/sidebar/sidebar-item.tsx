'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation';
import { useActiveRoute } from '@/lib/route-utils';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  label: string;
  icon: LucideIcon;
  href: string;
}

function SidebarItem({
  className,
  label,
  icon: Icon,
  href,
  ...props
}: React.ComponentProps<'div'> & SidebarItemProps) {
  const isActive = useActiveRoute(href);

  return (
    <div className={cn('w-full', className)} {...props}>
      <Button
        variant={isActive ? 'default' : 'ghost'}
        className={cn('w-full justify-start', isActive ? 'bg-primary text-primary-foreground' : '')}
        asChild
      >
        <Link href={href}>
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </Link>
      </Button>
    </div>
  );
}

export { SidebarItem, type SidebarItemProps };
