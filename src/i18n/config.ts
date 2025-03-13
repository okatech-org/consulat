export type Locale = (typeof locales)[number];

export const locales = ['fr', 'en', 'es'] as const;
export const defaultLocale: Locale = 'fr';
export const defaultNS = 'common';
