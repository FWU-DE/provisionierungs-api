import * as React from 'react';
import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';

const headlineVariants = cva('font-bold tracking-tight text-foreground', {
  variants: {
    size: {
      h1: 'text-3xl md:text-4xl',
      h2: 'text-2xl md:text-3xl',
      h3: 'text-xl md:text-2xl',
      h4: 'text-lg md:text-xl',
      h5: 'text-md md:text-md',
      h6: 'text-sm md:text-sm font-normal!',
    },
    spacing: {
      none: '',
      default: 'mb-4',
    },
  },
  defaultVariants: {
    size: 'h1',
    spacing: 'default',
  },
});

type HeadlineTag = 'h1' | 'h2' | 'h3' | 'h4';
type HeadlineSize = HeadlineTag | 'h5' | 'h6';

interface HeadlineProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headlineVariants> {
  tag?: HeadlineTag;
  size?: HeadlineSize;
  headline: string;
  subline?: string;
  sublineTag?: HeadlineTag;
  sublineSize?: HeadlineSize;
  sublineClassName?: string;
}

const Headline = React.forwardRef<HTMLHeadingElement, HeadlineProps>(
  (
    {
      className,
      tag = 'h1',
      size,
      spacing,
      headline,
      subline,
      sublineTag = 'h3',
      sublineSize = 'h6',
      sublineClassName,
      ...props
    },
    ref,
  ) => {
    const Component = tag;
    const SublineComponent = sublineTag;

    const headlineElement = (
      <Component
        ref={ref}
        className={cn(
          headlineVariants({
            size: size ?? tag,
            spacing: subline ? 'none' : spacing,
            className,
          }),
        )}
        {...props}
      >
        {headline}
      </Component>
    );

    if (!subline) {
      return headlineElement;
    }

    return (
      <div className={cn('flex flex-col gap-2', spacing === 'none' ? '' : 'mb-4')}>
        {headlineElement}
        <SublineComponent
          className={cn(
            headlineVariants({
              size: sublineSize,
              spacing: 'none',
              className: sublineClassName,
            }),
          )}
        >
          {subline}
        </SublineComponent>
      </div>
    );
  },
);

Headline.displayName = 'Headline';

export { Headline, headlineVariants };
