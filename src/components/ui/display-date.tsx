'use client';

import { useLocale } from "next-intl";

export function DisplayDate({date, options}: {date: Date | string | null, options?: Intl.DateTimeFormatOptions}) {
    const locale = useLocale();

    if (!date) return '';
    const dateValue = new Intl.DateTimeFormat(locale, options).format(new Date(date))

    return <span>{dateValue}</span>;
}
