'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

export function useTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const handleTabChange = (value: string, name: string = 'tab') => {
    const newQueryString = createQueryString(name, value);
    router.push(`${pathname}?${newQueryString}`);
  };

  return { handleTabChange, searchParams };
}
