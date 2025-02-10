'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useLayoutEffect } from 'react';

export function useTabs(tabName: string = 'tab', defaultTab?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get(tabName) || defaultTab || undefined;

  const createQueryString = React.useCallback(
    (name: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams],
  );

  const handleTabChange = useCallback(
    (value: string, name: string = tabName) => {
      const newQueryString = createQueryString(name, value);
      router.push(`${pathname}?${newQueryString}`);
    },
    [createQueryString, pathname, router, tabName],
  );

  useLayoutEffect(() => {
    if (defaultTab && !currentTab) {
      handleTabChange(defaultTab);
    }
  }, [defaultTab, currentTab, handleTabChange]);

  return { handleTabChange, searchParams, currentTab };
}
