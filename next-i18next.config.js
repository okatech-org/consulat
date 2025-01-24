module.exports = {
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'es', 'en'],
    localeDetection: false,
  },
  fallbackLng: 'fr',
  ns: ['common'],
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
