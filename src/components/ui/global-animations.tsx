'use client';

import React from 'react';

/**
 * Composant client pour les animations globales
 *
 * Note: Ce composant est une alternative aux styles CSS globaux définis dans /src/styles/animations.css
 * Il est recommandé d'utiliser le fichier CSS pour de meilleures performances, mais ce composant est utile
 * si vous préférez l'approche styled-jsx pour des cas spécifiques.
 */
export function GlobalAnimations() {
  return (
    <style jsx global>{`
      /* Ces animations sont déjà définies dans /src/styles/animations.css */
      /* Ce composant sert uniquement de fallback ou pour des animations spécifiques à un composant */
    `}</style>
  );
}
