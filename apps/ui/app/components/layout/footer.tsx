import * as React from 'react';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export interface FooterLinkProps {
  href: string;
  target?: string;
  text: string;
}

export interface FooterProps extends React.ComponentProps<'footer'> {
  links: FooterLinkProps[];
}

export function Footer({ links, className, ...props }: FooterProps) {
  const t = useTranslations('component/footer');
  return (
    <footer className={cn('bg-accent/50 border-t px-4 py-8 md:px-6', className)} {...props}>
      <div className="mx-auto flex flex-col items-center justify-between gap-6 md:flex-row">
        {/* Logo to the left */}
        <div className="shrink-0">
          <Link href="/apps">
            <Image
              src={'https://picsum.photos/200'}
              width={80} // Double the header's 40
              height={80} // Double the header's 40
              alt={t('logo-alt')}
              className={'rounded-md'}
            />
          </Link>
        </div>

        {/* Navigation to the right */}
        <nav className="flex flex-col items-center gap-4 md:flex-row md:justify-end md:gap-x-6 md:gap-y-2">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              target={link.target}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {link.text}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
