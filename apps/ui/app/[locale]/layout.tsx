import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { locales } from '../../i18n';
import '../globals.css';

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

  const messages = await getMessages();
  const tFooter = await getTranslations('component/footer');

  const footerLinks = [
    { href: '/help', text: tFooter('help') },
    { href: '/about', text: tFooter('about-us') },
    { href: '/legal', text: tFooter('legal-notice') },
    { href: '/privacy', text: tFooter('privacy') },
    { href: '/terms', text: tFooter('terms-and-conditions') },
  ];

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            {children}
            <Footer className={'mt-auto'} links={footerLinks} />
          </div>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
