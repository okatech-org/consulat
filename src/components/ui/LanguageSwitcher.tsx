'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTransition } from 'react';
import { Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';
import { Icons } from '@/components/ui/icons';

type LanguageSwitcherProps = Readonly<{
  defaultValue: string;
  languages: Array<{ value: string; label: string }>;
  label: string;
}>;

export default function LanguageSwitcher({
  defaultValue,
  languages,
  label,
}: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => setUserLocale(locale));
  }

  return (
    <Select value={defaultValue} onValueChange={onChange}>
      <SelectTrigger disabled={isPending} className="w-max max-w-[150px] gap-2">
        <SelectValue placeholder={label} />
        {isPending && <Icons.Spinner className="size-6 animate-spin" />}
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
