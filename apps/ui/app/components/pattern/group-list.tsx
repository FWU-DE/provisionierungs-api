'use client';

import * as React from 'react';
import type { Group } from '@/lib/model/group';
import { cn } from '@/lib/utils';
import { type LucideIcon, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Input } from '../ui/input';

interface GroupListProps extends React.ComponentProps<'div'> {
  headline?: string;
  groups: Group[];
  onClickGroup: (groupId: string) => void;
  isSearchable?: boolean;
  emptyStateIcon?: LucideIcon;
}

export function GroupList({
  className,
  headline,
  groups,
  onClickGroup,
  isSearchable = false,
  emptyStateIcon,
  ...props
}: GroupListProps) {
  const t = useTranslations('component/group-list');
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredGroups = React.useMemo(() => {
    if (!searchTerm) {
      return groups;
    }
    return groups.filter((group) => group.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [groups, searchTerm]);

  return (
    <div className={cn(className, 'flex flex-col gap-6')} {...props}>
      {isSearchable ? (
        <div className="relative flex items-center">
          <Search className="text-muted-foreground absolute left-3 h-5 w-5" />
          <Input
            className="border-0 py-0 pl-10 pr-10 text-lg font-semibold text-black shadow-none placeholder:text-lg placeholder:font-semibold placeholder:text-black focus-visible:ring-0 md:text-lg"
            placeholder={headline ?? t('headline')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
          {searchTerm && (
            <button
              className="absolute right-3 cursor-pointer"
              onClick={() => {
                setSearchTerm('');
              }}
              aria-label="Clear search"
            >
              <X className="text-muted-foreground h-5 w-5" />
            </button>
          )}
        </div>
      ) : (
        <h3 className={'text-lg font-semibold'}>{headline ?? t('headline')}</h3>
      )}

      {filteredGroups.length > 0 ? (
        <ul
          className="flex max-h-80 flex-row flex-wrap gap-x-6 gap-y-4 overflow-auto"
          role="list"
          aria-label={t('groups')}
        >
          {filteredGroups.map((group) => (
            <li key={group.id}>
              <a
                role="button"
                className="hover:border-primary relative flex cursor-pointer items-center rounded-2xl border-2 border-gray-300 bg-white px-8 py-4 text-xs"
                onClick={() => {
                  onClickGroup(group.id);
                }}
              >
                <span>{group.name ?? 'unnamed'}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 flex h-full flex-col items-center justify-center gap-4 text-center">
          {emptyStateIcon && (
            <div
              className="bg-muted flex h-20 w-20 items-center justify-center rounded-xl border"
              title={t('empty-state-image')}
            >
              {React.createElement(emptyStateIcon, {
                'size': 40,
                'className': 'text-muted-foreground',
                'aria-label': t('empty-state-image'),
              })}
            </div>
          )}
          <p className="text-muted-foreground text-sm">{t('no-groups')}</p>
        </div>
      )}
    </div>
  );
}
