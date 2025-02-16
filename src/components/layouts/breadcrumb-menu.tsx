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
    <Breadcrumb>
      <BreadcrumbList>
        {pathnameParts.map((part, index) => (
          <Fragment key={index}>
            <BreadcrumbItem key={index}>
              {index !== pathnameParts.length - 1 ? (
                <BreadcrumbLink href={`/${part}`}>{part}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{part}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index !== pathnameParts.length - 1 && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
