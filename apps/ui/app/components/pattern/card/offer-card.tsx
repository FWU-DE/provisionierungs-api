import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { SchoolIcon, SettingsIcon, UsersIcon } from 'lucide-react';
import Image from 'next/image';

export function OfferCardSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <Card className={cn(className, 'w-full bg-gray-50')} {...props}>
      <CardHeader>
        <div className={'flex justify-start gap-6'}>
          <Skeleton className={'h-[76px] w-[76px] rounded-md shadow-md'} />
          <div className={'flex-1 pt-1'}>
            <Skeleton className={'mb-2 h-4 w-[140px]'} />
            <Skeleton className={'mb-2 h-3 w-[100px]'} />
            <Skeleton className={'h-3 w-[120px]'} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className={'mb-2 h-3 w-full'} />
        <div className="mt-2 flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export interface OfferCardProps {
  offerId: number;
  publisher?: string;
  title?: string;
  titleLong?: string;
  description?: string;
  logo?: string;
  link?: string;
  groups?: string[];
  schools?: string[];
}

export function OfferCard({
  offerId,
  publisher,
  title,
  titleLong,
  description,
  logo,
  link,
  groups,
  schools,
  className,
  ...props
}: React.ComponentProps<'div'> & OfferCardProps) {
  return (
    <Card className={cn(className, 'w-full bg-gray-50')} {...props}>
      <CardHeader>
        <div className={'flex min-w-0 justify-start gap-6'}>
          {logo && (
            <Image
              src={logo}
              width={76}
              height={76}
              alt={titleLong ?? title ?? ''}
              className={'h-[76px] w-[76px] rounded-md bg-white object-contain shadow-md'}
            />
          )}
          <div className={'max-w-full overflow-hidden pt-3'}>
            {title && <CardTitle title={titleLong ?? title}>{title}</CardTitle>}
            {publisher && <div className="text-sm">{publisher}</div>}
            {link && (
              <Button
                variant={'link'}
                className={'block max-w-full overflow-hidden text-ellipsis pl-0'}
                asChild
                title={link}
              >
                <Link href={link}>{link}</Link>
              </Button>
            )}
          </div>
        </div>
        <CardAction>
          <Button
            variant={'ghost'}
            className={'px-0! py-0! inline-flex h-10 w-10 items-center justify-center rounded-full'}
            asChild
          >
            <Link href={`/apps/settings/${String(offerId)}`}>
              <SettingsIcon className="h-4 w-4" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {description && (
          <CardDescription
            className={'overflow-hidden text-ellipsis text-nowrap'}
            title={description}
          >
            {description}
          </CardDescription>
        )}

        {groups && groups.length > 0 && (!schools || schools.length === 0) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {groups.map((group) => (
              <Badge key={group} variant="default">
                <span className="font-semibold">{group}</span>
                <UsersIcon className="ml-1 h-4 w-4" />
              </Badge>
            ))}
          </div>
        )}

        {schools && schools.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {schools.map((school) => (
              <Badge key={school} variant="default">
                <span className="font-semibold">{school}</span>
                <SchoolIcon className="ml-1 h-4 w-4" />
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
