'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface SchoolListProps extends React.ComponentProps<'div'> {
  availableSchoolIds: string[];
  selectedSchoolId?: string;
  action?: (formData: FormData) => Promise<void> | void;
}

export function SchoolList({
  className,
  action,
  availableSchoolIds,
  selectedSchoolId,
  ...props
}: SchoolListProps) {
  const t = useTranslations('component/school-list');

  return (
    <div className={cn(className, 'my-6')} {...props}>
      <h3 className={'text-lg font-semibold'}>{t('headline')}</h3>

      <ul className="mt-4 space-y-2" role="list" aria-label={t('schools')}>
        {availableSchoolIds.map((schoolId) => (
          <li key={schoolId}>
            <form action={action}>
              <input type="hidden" name="schoolId" value={schoolId} />

              <Button
                type="submit"
                variant="secondary"
                className={cn('', selectedSchoolId === schoolId ? 'font-bold' : '')}
              >
                <span>{schoolId}</span>
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
