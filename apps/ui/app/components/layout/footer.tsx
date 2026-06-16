import * as React from 'react';
import logo from '@/../assets/images/vidis-logo-white.svg';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { StaticImageData } from 'next/image';
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
    <footer className={cn('bg-primary border-t', className)} {...props}>
      <div className="mx-auto flex flex-col items-center justify-between gap-6 px-4 xl:container md:flex-row">
        {/* Navigation */}
        <nav className="flex flex-col items-center gap-4 md:flex-row md:justify-end md:gap-x-10 md:gap-y-2">
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

        {/* Logo */}
        <div className="shrink-0">
          <Link href="/apps" className={'text-foreground hover:text-primary'}>
            <Image
              src={logo as StaticImageData}
              width={80}
              height={80}
              alt={t('logo-alt')}
              className={'m-8 h-12 w-auto rounded-md'}
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
