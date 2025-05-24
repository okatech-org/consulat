'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useTabs<T extends string>(key: string, defaultValue: T) {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get(key) as T;
  const [currentTab, setCurrentTab] = useState<T>(urlTab ?? defaultValue);

  const handleTabChange = (value: T) => {
    setCurrentTab(value);

    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);

    // Use replaceState to update URL without page reload
    const newUrl = `?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
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
