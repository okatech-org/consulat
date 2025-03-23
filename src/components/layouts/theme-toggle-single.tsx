'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ThemeToggleSingleProps {
  className?: string;
}

export function ThemeToggleSingle({ className }: ThemeToggleSingleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Éviter les problèmes d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative rounded-full border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700',
        className,
      )}
      aria-label={isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          isDark ? 'opacity-0' : 'opacity-100',
        )}
      >
        <MoonIcon className={'size-icon'} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? -180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          isDark ? 'opacity-100' : 'opacity-0',
        )}
      >
        <SunIcon className={'size-icon'} />
      </motion.div>
    </Button>
  );
}
