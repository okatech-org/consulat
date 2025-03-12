'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

export interface ThemeToggleSingleProps {
  className?: string;
}

export function ThemeToggleSingle({ className }: ThemeToggleSingleProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const size = isMobile ? 'sm' : 'md';
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Éviter les problèmes d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Tailles des icônes selon la prop size
  const iconSizes = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  };

  const buttonSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const isDark = theme === 'dark';

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        buttonSizes[size],
        'relative rounded-full border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700',
        className,
      )}
      aria-label={isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: isDark ? 1 : 0 }}
      >
        <MoonIcon className={iconSizes[size]} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? -180 : 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: isDark ? 0 : 1 }}
      >
        <SunIcon className={iconSizes[size]} />
      </motion.div>
    </Button>
  );
}
