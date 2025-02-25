// index.ts (no need changes when you add a namespace file)
import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from './locale';

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  const messages = await import(`./messages/${locale}/index.ts`);

  return {
    locale,
    messages: messages.default,
    now: new Date(),
  };
});
