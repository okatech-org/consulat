'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    // S'assurer que la classe est appliquée au html
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (resolvedTheme) {
      root.classList.add(resolvedTheme);
      root.style.colorScheme = resolvedTheme;
    }
  }, [resolvedTheme]);

  return <>{children}</>;
}
