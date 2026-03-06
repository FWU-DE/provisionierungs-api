import AccessTokenCopyBox from '@/components/access-token-copy-box';
import { Header } from '@/components/layout/header';
import { SidebarMain } from '@/components/layout/sidebar/sidebar-main';
import { Separator } from '@/components/ui/separator';
import { verifySession } from '@/lib/session';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { locales } from '../../../i18n';
import '../../globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('app');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }

  // @todo: Remove after implementation of UI app is mostly done!
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const session = (await verifySession())!;
  const showJWT = false;

  return (
    <>
      {/* @todo: Remove after implementation of UI app is mostly done! */}
      <div className="mt-20 p-4">
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {showJWT && <AccessTokenCopyBox token={session.accessToken} />}
      </div>

      <Header />
      <main className="container mx-auto px-4 pt-20">
        <div className="flex w-full flex-col md:flex-row md:gap-6">
          <aside className="w-full md:w-1/4">
            <SidebarMain />
          </aside>

          <Separator className="mt-6 md:hidden" />

          <article className="w-full pt-10 md:w-3/4 md:pt-0">{children}</article>
        </div>
      </main>
    </>
  );
}
