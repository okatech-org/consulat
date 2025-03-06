'use client';

import * as React from 'react';

import { useTransition } from 'react';
import { Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';
import { useLocale } from 'next-intl';
import { MultiSelect } from './multi-select';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const languages = ['fr', 'en'];
  const currentLanguage = useLocale();

  function onChange(value: string) {
    const locale = value.toLowerCase() as Locale;
    startTransition(() => setUserLocale(locale));
  }

  return (
    <MultiSelect<string>
      type="single"
      options={languages.map((lang) => ({
        label: lang.toUpperCase(),
        value: lang,
      }))}
      selected={currentLanguage}
      onChange={onChange}
      disabled={isPending}
    />
  );
}
