import fr from './locales/fr.json';

type Locales = typeof fr;

declare global {
  interface IntlMessages extends Locales {}
}
