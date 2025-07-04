'use client';

import { useState, useEffect } from 'react';

/**
 * Hook pour détecter si une media query correspond
 * @param query La media query à vérifier (ex: '(max-width: 768px)')
 * @returns boolean indiquant si la media query correspond
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Vérifier si window est défini (côté client uniquement)
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);

    // Définir l'état initial
    setMatches(media.matches);

    // Callback pour mettre à jour l'état quand la media query change
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Ajouter l'écouteur d'événement
    media.addEventListener('change', listener);

    // Nettoyer l'écouteur d'événement
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}
