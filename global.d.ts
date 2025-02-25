type Messages = (typeof import('./src/i18n/messages/fr'))['default'];

// eslint-disable-next-line
declare interface IntlMessages extends Messages {}
