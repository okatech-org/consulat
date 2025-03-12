'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useLocale, useTranslations } from 'next-intl';
import { setUserLocale } from '@/i18n/locale';
import { Locale } from '@/i18n/config';

export interface LanguageSwitcherSingleProps {
  className?: string;
}

type Language = {
  code: string;
  name: string;
  flag: string;
};

export function LanguageSwitcherSingle({ className }: LanguageSwitcherSingleProps) {
  const t = useTranslations('common.languages');

  const languages: Language[] = [
    { code: 'fr', name: t('fr'), flag: '🇫🇷' },
    { code: 'en', name: t('en'), flag: '🇬🇧' },
    { code: 'es', name: t('es'), flag: '🇪🇸' },
  ];
  const isMobile = useMediaQuery('(max-width: 640px)');
  const size = isMobile ? 'sm' : 'md';
  const currentLocale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  // Tailles des boutons et icônes selon la prop size
  const buttonSizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  const flagSizes = {
    sm: 'text-base',
    md: 'text-md',
    lg: 'text-md',
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            buttonSizes[size],
            'relative flex items-center gap-2 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 border-0 shadow-sm px-3 transition-all duration-300',
            'dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700',
            isOpen && 'bg-gray-100 dark:bg-neutral-700',
            className,
          )}
          aria-label="Changer de langue"
        >
          <span className={cn('flex items-center', flagSizes[size])}>
            <span className="text-lg">
              {languages.find((language) => language.code === currentLocale)?.flag}
            </span>
          </span>
          <span className="hidden xs:inline-block text-sm font-medium text-gray-800 dark:text-gray-200">
            {languages.find((language) => language.code === currentLocale)?.name}
          </span>
          <ChevronDown
            className="size-4 text-gray-400 transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[12rem] rounded-xl p-1 bg-white shadow-lg border border-gray-100 animate-in fade-in-80 zoom-in-95 dark:bg-neutral-900 dark:border-neutral-800"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            asChild
            className="cursor-pointer focus:bg-gray-50 dark:focus:bg-neutral-800"
          >
            <button
              type="button"
              onClick={async () => {
                await setUserLocale(language.code as Locale);
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                currentLocale === language.code
                  ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800',
              )}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
              {currentLocale === language.code && (
                <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              )}
            </button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
