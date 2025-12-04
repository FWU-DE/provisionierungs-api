import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';

export default function Login() {
  const t = useTranslations('auth');
  const tApp = useTranslations('app');

  return (
    <div className="bg-linear-to-br flex min-h-screen items-center justify-center from-gray-50 to-gray-100 px-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{tApp('title')}</CardTitle>
          <CardDescription>{t('login_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" size="lg">
            <Link href="/home">{t('login')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
