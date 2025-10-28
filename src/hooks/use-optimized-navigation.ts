'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useTransition, useRef } from 'react';

interface NavigationOptions {
  scroll?: boolean;
  instant?: boolean;
}

export function useOptimizedNavigation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const navigationTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const navigateTo = useCallback(
    (path: string, options: NavigationOptions = {}) => {
      const { scroll = true, instant = false } = options;

      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
      }

      if (instant) {
        router.push(path);
        if (scroll) {
          requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
          });
        }
        return;
      }

      startTransition(() => {
        router.push(path);

        if (scroll) {
          requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
          });
        }
      });
    },
    [router],
  );

  return {
    navigateTo,
    isPending,
  };
}
