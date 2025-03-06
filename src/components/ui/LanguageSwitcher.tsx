'use client';

import * as React from 'react';

import { useTransition } from 'react';
import { Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';
import { useLocale, useTranslations } from 'next-intl';
import { MultiSelect } from './multi-select';

const LANGUAGE_KEYS = {
  FR: 'fr_short',
  EN: 'en_short',
  ES: 'es_short',
} as const;

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('common.languages');
  const languages = Object.keys(LANGUAGE_KEYS);
  const currentLanguage = useLocale();

  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => setUserLocale(locale));
  }

  return (
    <MultiSelect<string>
      type="single"
      options={languages.map((lang) => ({
        label: t(LANGUAGE_KEYS[lang as keyof typeof LANGUAGE_KEYS]),
        value: lang,
      }))}
      selected={currentLanguage}
      onChange={onChange}
      disabled={isPending}
    />
  );
}
