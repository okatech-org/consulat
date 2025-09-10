'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

// Composant pour synchroniser le thème avec les cookies côté client
export function ThemeSync() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    if (theme && typeof window !== 'undefined') {
      // Synchroniser le cookie avec l'état côté client
      document.cookie = `theme=${theme}; path=/; max-age=31536000`; // 1 an
      
      // Mettre à jour la classe sur html pour éviter les conflits
      const html = document.documentElement;
      if (resolvedTheme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }, [theme, resolvedTheme]);

  return null; // Ce composant ne rend rien
}
