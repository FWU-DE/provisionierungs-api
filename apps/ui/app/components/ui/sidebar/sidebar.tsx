'use client';

import * as React from 'react';

export function Sidebar({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <nav className={className} {...props}>
      <ul className={'flex list-none flex-col gap-2'}>{children}</ul>
    </nav>
  );
}
