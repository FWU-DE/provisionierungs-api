'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from '@/lib/navigation';
import { LanguagesIcon } from 'lucide-react';
import { type Locale, useLocale, useTranslations } from 'next-intl';

const FLAGS: Record<string, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
};

export function LanguageSwitcher() {
  const t = useTranslations('component/language-switcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  const languageOptions = [
    {
      icon: '🇩🇪',
      label: t('german'),
      value: 'de' as const,
    },
    {
      icon: '🇬🇧',
      label: 'english',
      value: 'en' as const,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-2 px-3">
          <span className="text-lg" aria-hidden="true">
            {FLAGS[locale] || '🌐'}
          </span>
          <span className="hidden sm:inline-block">{t('label')}</span>
          <LanguagesIcon className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              handleLanguageChange(option.value);
            }}
            className="cursor-pointer gap-2"
          >
            <span className="text-lg" aria-hidden="true">
              {option.icon}
            </span>
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
