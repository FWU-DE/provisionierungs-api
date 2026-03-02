import { Header } from '@/components/layout/header';
import { SidebarMain } from '@/components/layout/sidebar/sidebar-main';
import { Separator } from '@/components/ui/separator';
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

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 pt-20">
        <div className="flex w-full flex-col md:flex-row md:gap-6">
          <div className="w-full md:w-1/4">
            <SidebarMain />
          </div>

          <Separator className="mt-6 md:hidden" />

          <div className="w-full pt-10 md:w-3/4 md:pt-0">{children}</div>
        </div>
      </div>
    </>
  );
}
