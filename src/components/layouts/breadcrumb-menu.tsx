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

export function BreadcrumbMenu() {
  const pathname = usePathname();
  const pathnameParts = pathname.split('/').filter(Boolean);

  return (
    <Breadcrumb className="w-full overflow-hidden">
      <BreadcrumbList className="truncate text-nowrap flex-nowrap">
        {pathnameParts.map((part, index) => (
          <Fragment key={index}>
            <BreadcrumbItem key={index} className="">
              {index !== pathnameParts.length - 1 ? (
                <BreadcrumbLink href={`/${pathnameParts.slice(0, index + 1).join('/')}`}>
                  {part}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{part}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index !== pathnameParts.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
