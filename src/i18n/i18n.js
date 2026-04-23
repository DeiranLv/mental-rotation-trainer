import lv from './lv.json';

const locales = { lv };

const DEFAULT_LOCALE = 'lv';

let currentLocale = DEFAULT_LOCALE;

export function setLocale(locale) {
  if (locales[locale]) {
    currentLocale = locale;
  }
}

// Supports dot-notation keys: t('home.title') → locales.lv.home.title
export function t(key) {
  const translations = locales[currentLocale] ?? locales[DEFAULT_LOCALE];
  const value = key.split('.').reduce((obj, k) => obj?.[k], translations);
  return value ?? key;
}
