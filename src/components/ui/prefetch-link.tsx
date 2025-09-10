'use client';

import { ReactNode, MouseEvent, useCallback, useRef } from 'react';
import { useOptimizedNavigation } from '@/hooks/use-optimized-navigation';

interface PrefetchLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  instant?: boolean; // Navigation instantanée
  prefetchDelay?: number; // Délai avant préchargement (ms)
}

export function PrefetchLink({ 
  href, 
  children, 
  className, 
  style, 
  instant = false,
  prefetchDelay = 50 
}: PrefetchLinkProps) {
  const { navigateTo, prefetchPageData } = useOptimizedNavigation();
  const prefetchTimeout = useRef<NodeJS.Timeout>();
  const hasPrefetched = useRef(false);

  const handleMouseEnter = useCallback(() => {
    if (hasPrefetched.current) return;
    
    // Précharger après un court délai
    prefetchTimeout.current = setTimeout(() => {
      hasPrefetched.current = true;
      prefetchPageData(href);
    }, prefetchDelay);
  }, [href, prefetchPageData, prefetchDelay]);

  const handleMouseLeave = useCallback(() => {
    if (prefetchTimeout.current) {
      clearTimeout(prefetchTimeout.current);
    }
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    
    // Annuler le préchargement s'il est en cours
    if (prefetchTimeout.current) {
      clearTimeout(prefetchTimeout.current);
    }

    // Navigation instantanée ou normale
    navigateTo(href, { instant });
  }, [href, navigateTo, instant]);

  // Précharger également au focus (pour l'accessibilité clavier)
  const handleFocus = useCallback(() => {
    if (!hasPrefetched.current) {
      hasPrefetched.current = true;
      prefetchPageData(href);
    }
  }, [href, prefetchPageData]);

  return (
    <a
      href={href}
      className={className}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
