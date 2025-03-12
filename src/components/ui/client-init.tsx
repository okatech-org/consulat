'use client';

import { useEffect } from 'react';

/**
 * Composant qui s'assure que les styles du client correspondent à ceux du serveur
 * Pour éviter les erreurs d'hydratation
 */
export function ClientInit() {
  useEffect(() => {
    // S'assurer que la propriété overscroll-behavior-x est cohérente entre le serveur et le client
    if (document.body.style.overscrollBehaviorX === '') {
      document.body.style.overscrollBehaviorX = 'auto';
    }

    // Cette fonction peut être étendue pour gérer d'autres propriétés problématiques

    // Nettoyer les styles au démontage du composant si nécessaire
    return () => {
      // Nettoyage si nécessaire
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
