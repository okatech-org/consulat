'use client';

import * as React from 'react';

import { useTransition } from 'react';
import { Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';
import { CountryCode } from '@/lib/autocomplete-datas';
import { useTranslations } from 'next-intl';
import { MultiSelect } from './multi-select';

type LanguageSwitcherProps = Readonly<{
  defaultValue: string;
  languages: string[];
}>;

const LANGUAGE_KEYS = ['FR', 'EN', 'ES'] as const;

export default function LanguageSwitcher({
  defaultValue,
  languages,
}: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('common.languages');

  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => setUserLocale(locale));
  }

  return (
    <MultiSelect<CountryCode>
      type="single"
      options={LANGUAGE_KEYS.map((lang) => ({
        // @ts-expect-error - We know that the language is in the list
        label: t(lang),
        value: lang as CountryCode,
      }))}
      selected={defaultValue as CountryCode}
      onChange={onChange}
      disabled={isPending}
    />
  );
}
