'use client';

import * as React from 'react';
import { format, Locale } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  onSelect,
  placeholder,
  className,
  disabled = false,
}: DatePickerProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const localeCode = useLocale();
  const t = useTranslations('inputs.datetime');
  const localeMapping: Record<string, Locale> = { fr };
  const mappedLocale = localeMapping[localeCode] ?? fr;

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
          onClick={() => setPopoverOpen(true)}
        >
          <CalendarIcon className="mr-1 size-4" />
          {date ? (
            format(date, 'PPP', { locale: fr })
          ) : (
            <span>{placeholder ?? t('pick_date')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            setPopoverOpen(false);
            onSelect?.(newDate);
          }}
          initialFocus
          locale={mappedLocale}
        />
      </PopoverContent>
    </Popover>
  );
}
