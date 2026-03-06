'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      visibleToasts={6}
      duration={5000}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'group toast flex items-center gap-3 w-full px-4 py-2 rounded-xl border bg-background text-foreground shadow-lg font-sans',
          title: 'font-semibold',
          error:
            'bg-red-50! text-red-600! border-red-200! dark:bg-red-950! dark:text-red-400! dark:border-red-900!',
          success:
            'bg-emerald-50! text-emerald-600! border-emerald-200! dark:bg-emerald-950! dark:text-emerald-400! dark:border-emerald-900!',
          warning:
            'bg-amber-50! text-amber-600! border-amber-200! dark:bg-amber-950! dark:text-amber-400! dark:border-amber-900!',
          info: 'bg-sky-50! text-sky-600! border-sky-200! dark:bg-sky-950! dark:text-sky-400! dark:border-sky-900!',
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
