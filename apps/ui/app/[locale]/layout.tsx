import icon32 from '@/../assets/images/cropped-Vector-32x32.png';
import appleIcon from '@/../assets/images/cropped-Vector-180x180.png';
import icon192 from '@/../assets/images/cropped-Vector-192x192.png';
import msTileIcon from '@/../assets/images/cropped-Vector-270x270.png';
import { Footer, type FooterLinkProps } from '@/components/layout/footer';
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
    icons: {
      icon: [
        {
          url: icon32.src,
          sizes: '32x32',
        },
        {
          url: icon192.src,
          sizes: '192x192',
        },
      ],
      apple: appleIcon.src,
    },
    other: {
      'msapplication-TileImage': msTileIcon.src,
    },
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

  const footerLinks: FooterLinkProps[] = [
    { href: 'https://www.vidis.schule/', text: tFooter('about-us'), target: '_blank' },
    {
      href: 'https://www.vidis.schule/impressum/',
      text: tFooter('legal-notice'),
      target: '_blank',
    },
    {
      href: 'https://www.vidis.schule/datenschutzerklaerung',
      text: tFooter('privacy'),
      target: '_blank',
    },
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
