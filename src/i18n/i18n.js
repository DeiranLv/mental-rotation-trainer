import lv from './lv.json';

const locales = { lv };
const DEFAULT_LOCALE = 'lv';
let currentLocale = DEFAULT_LOCALE;

export function setLocale(locale) {
  if (locales[locale]) currentLocale = locale;
}

// Supports dot-notation: t('home.title')
// Supports interpolation: t('practice.counter', { current: 1, total: 3 })
export function t(key, vars = {}) {
  const translations = locales[currentLocale] ?? locales[DEFAULT_LOCALE];
  let value = key.split('.').reduce((obj, k) => obj?.[k], translations);
  if (value == null) return key;
  Object.entries(vars).forEach(([k, v]) => {
    value = value.replaceAll(`{{${k}}}`, v);
  });
  return value;
}
