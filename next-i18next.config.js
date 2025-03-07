module.exports = {
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    localeDetection: false,
  },
  fallbackLng: 'fr',
  ns: ['common'],
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
