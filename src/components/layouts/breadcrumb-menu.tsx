'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '../ui/breadcrumb';
import { Fragment } from 'react';
import { ROUTES } from '@/schemas/routes';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@/hooks/use-media-query';
import Link from 'next/link';

export function BreadcrumbMenu() {
  const isMobile = useMediaQuery('(max-width: 468px)');
  const pathname = usePathname();
  const pathnameParts = pathname.split('/').filter(Boolean) as Array<keyof typeof ROUTES>;
  const t = useTranslations('navigation.menu');

  return (
    <Breadcrumb className="w-full flex-nowrap text-nowrap truncate text-ellipsis overflow-hidden">
      <BreadcrumbList className="flex-nowrap">
        {pathnameParts.map((part, index) => (
          <Fragment key={index}>
            <BreadcrumbItem key={index} className="">
              {index !== pathnameParts.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link href={`/${pathnameParts.slice(0, index + 1).join('/')}`}>
                    {isMobile ? '...' : index <= 1 ? t(part) : part}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{index <= 1 ? t(part) : part}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index !== pathnameParts.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
