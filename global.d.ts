import fr from './messages/fr.json';

type Locales = typeof fr;

declare global {
  interface IntlMessages extends Locales {}
}
