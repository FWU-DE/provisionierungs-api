import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/lib/navigation';
import { verifySession } from '@/lib/session';
import { getLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export default async function Login() {
  const t = await getTranslations('auth');
  const tApp = await getTranslations('app');

  const session = await verifySession();

  if (session?.isAuth) {
    const locale = await getLocale();
    redirect(`/${locale}/apps`);
  }

  return (
    <main className="bg-linear-to-br flex min-h-screen items-center justify-center from-gray-50 to-gray-100 px-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{tApp('title')}</CardTitle>
          <CardDescription>{t('login_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" size="lg">
            <Link href="/apps">{t('login')}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
