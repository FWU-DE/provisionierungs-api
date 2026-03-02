import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation';
import { verifySession } from '@/lib/session';
import { getUserSchoolSelection } from '@/lib/user/user';
import { cn } from '@/lib/utils';
import { HouseIcon, LogOutIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import LinkNative from 'next/link';

import { LanguageSwitcher } from './language-switcher';

export async function Header({ className, ...props }: React.ComponentProps<'div'>) {
  const t = await getTranslations('component/header');
  const tAuth = await getTranslations('auth');

  const session = await verifySession();
  const isLoggedIn = session?.isAuth ?? false;

  const selectedSchool = getUserSchoolSelection();

  return (
    <header
      className={cn(
        'bg-accent fixed left-0 right-0 top-0 flex items-center justify-between px-4 py-2',
        className,
      )}
      {...props}
    >
      {/* @todo: replace with actual logo */}
      <Image
        src={'https://picsum.photos/200'}
        width={40}
        height={40}
        alt={'App Logo'}
        className={'rounded-md'}
      />

      <div className="flex items-center gap-2">
        <LanguageSwitcher />

        {isLoggedIn && (
          <Button variant={'outline'} asChild>
            <Link href="/user/select-school" title={t('select-school')}>
              {selectedSchool}
              <HouseIcon className="h-4 w-4" />
            </Link>
          </Button>
        )}

        {isLoggedIn ? (
          <Button variant={'secondary'} asChild>
            <LinkNative href="/api/logout" title={tAuth('logout')}>
              <span className="hidden md:inline">{tAuth('logout')}</span>
              <LogOutIcon className="h-4 w-4" />
            </LinkNative>
          </Button>
        ) : (
          <Button variant={'secondary'} asChild>
            <LinkNative href="/api/login" title={tAuth('login')}>
              <span className="hidden md:inline">{tAuth('login')}</span>
              <LogOutIcon className="h-4 w-4" />
            </LinkNative>
          </Button>
        )}
      </div>
    </header>
  );
}
