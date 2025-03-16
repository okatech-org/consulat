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

export function BreadcrumbMenu() {
  const pathname = usePathname();
  const pathnameParts = pathname.split('/').filter(Boolean) as Array<keyof typeof ROUTES>;
  const t = useTranslations('navigation.breadcrumb');

  console.log(pathnameParts);

  return (
    <Breadcrumb className="w-full overflow-hidden">
      <BreadcrumbList className="truncate text-nowrap flex-nowrap">
        {pathnameParts.map((part, index) => (
          <Fragment key={index}>
            <BreadcrumbItem key={index} className="">
              {index !== pathnameParts.length - 1 ? (
                <BreadcrumbLink href={`/${pathnameParts.slice(0, index + 1).join('/')}`}>
                  {/* @ts-expect-error - part is not a valid key */}
                  {index <= 1 ? t(part) : part}
                </BreadcrumbLink>
              ) : (
                // @ts-expect-error - part is not a valid key
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
