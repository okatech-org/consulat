'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export function useTabs<T extends string>(key: string, defaultValue: T) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get(key) as T) ?? defaultValue;

  const handleTabChange = (value: T) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`);
  };

  return {
    currentTab,
    handleTabChange,
  };
}
