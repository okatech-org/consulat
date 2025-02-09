'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return { handleTabChange, searchParams };
}
