'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

export function useStoredTabs<T extends string>(key: string, defaultValue: T) {
  const [currentTab, setCurrentTab] = useState<T>(defaultValue);

  useEffect(() => {
    const storedTab = sessionStorage.getItem(key);
    if (storedTab) {
      setCurrentTab(storedTab as T);
    }
  }, [key]);

  useEffect(() => {
    sessionStorage.setItem(key, currentTab);
  }, [currentTab, key]);

  return {
    currentTab,
    setCurrentTab,
  };
}
