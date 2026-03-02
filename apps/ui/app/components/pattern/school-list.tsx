'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { type User } from '@/lib/model/user';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

// @todo: Copy to create a group list!
// @todo: Style!

interface SchoolListProps extends React.ComponentProps<'div'> {
  user: User;
  action?: (formData: FormData) => Promise<void> | void;
}

export function SchoolList({ className, action, user, ...props }: SchoolListProps) {
  const t = useTranslations('component/school-list');

  // @todo: Pass in school available and selected school from parent component/page.
  // const userContext = useUser();
  const schoolsAvailable = user.schulkennung;

  return (
    <div className={className} {...props}>
      <h3 className={'text-lg font-semibold'}>{t('headline')}</h3>

      <ul className="mt-4 space-y-2" role="list" aria-label="Schulen">
        {schoolsAvailable.map((school) => (
          <li key={school}>
            <form action={action}>
              <input type="hidden" name="schoolId" value={school} />

              <Button
                type="submit"
                variant="secondary"
                className={cn('', user.selectedSchool === school ? 'font-bold' : '')}
              >
                <span>{school}</span>
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
