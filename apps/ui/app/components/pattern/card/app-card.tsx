import * as React from 'react';
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
import { SettingsIcon } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';
// import { UsersIcon } from 'lucide-react';
import Image from 'next/image';

// @todo: Add clearance status (groups or whole school)!

export function AppCardSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <Card className={cn(className, 'w-full max-w-md bg-gray-50')} {...props}>
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
        <Skeleton className={'h-3 w-full'} />
      </CardContent>
    </Card>
  );
}

interface AppCardProps {
  offerId: number;
  publisher?: string;
  title?: string;
  titleLong?: string;
  description?: string;
  logo?: string;
  link?: string;
}

export function AppCard({
  offerId,
  publisher,
  title,
  titleLong,
  description,
  logo,
  link,
  className,
  ...props
}: React.ComponentProps<'div'> & AppCardProps) {
  return (
    <Card className={cn(className, 'w-full max-w-md bg-gray-50')} {...props}>
      <CardHeader>
        <div className={'flex justify-start gap-6'}>
          {logo && (
            <Image
              src={logo}
              width={76}
              height={76}
              alt={titleLong ?? title ?? ''}
              className={'h-[76px] w-[76px] rounded-md bg-white object-contain shadow-md'}
            />
          )}
          <div className={'pt-1'}>
            {title && <CardTitle title={titleLong ?? title}>{title}</CardTitle>}
            {publisher && <span className="text-sm">{publisher}</span>}
            {link && (
              <Button variant={'link'} className={'pl-0'} asChild>
                <Link href={link}>{link}</Link>
              </Button>
            )}
          </div>
        </div>
        <CardAction>
          <Button
            variant={'ghost'}
            className={'inline-flex h-10 w-10 items-center justify-center rounded-full !px-0 !py-0'}
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

        {/*
        <Badge variant="default">
          <span className={'font-semibold'}>Gruppe XYZ</span>
          <UsersIcon className="ml-1 h-4 w-4" />
        </Badge>
        */}
      </CardContent>
    </Card>
  );
}
