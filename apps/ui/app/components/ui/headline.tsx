import * as React from 'react';
import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';

const headlineVariants = cva('font-bold tracking-tight text-foreground mb-4', {
  variants: {
    size: {
      h1: 'text-3xl md:text-4xl',
      h2: 'text-2xl md:text-3xl',
      h3: 'text-xl md:text-2xl',
      h4: 'text-lg md:text-xl',
    },
  },
  defaultVariants: {
    size: 'h1',
  },
});

type HeadlineTag = 'h1' | 'h2' | 'h3' | 'h4';
type HeadlineSize = HeadlineTag;

interface HeadlineProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headlineVariants> {
  tag?: HeadlineTag;
  size?: HeadlineSize;
  headline: string;
}

const Headline = React.forwardRef<HTMLHeadingElement, HeadlineProps>(
  ({ className, tag = 'h1', size, headline, ...props }, ref) => {
    const Component = tag;

    return (
      <Component
        ref={ref}
        className={cn(headlineVariants({ size: size ?? tag, className }))}
        {...props}
      >
        {headline}
      </Component>
    );
  },
);

Headline.displayName = 'Headline';

export { Headline, headlineVariants };
