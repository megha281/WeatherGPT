import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import translations, { LANGUAGES, missingTranslationKeys } from '../i18n/translations';
import { alertTerm, weatherTerm } from '../i18n/localeData';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'weathergpt.language';

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem(STORAGE_KEY) || 'en');

  const locale = LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale.code);
    document.documentElement.lang = locale.code;
    document.documentElement.dir = locale.dir;
  }, [locale]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      const missing = missingTranslationKeys(locale.code);
      if (missing.length) console.warn(`Missing ${locale.code} translation keys:`, missing);
    }
  }, [locale.code]);

  // Missing keys fall back to English so a partial translation never breaks a page.
  const t = useCallback(
    (key, values = {}) => {
      const fallback = typeof values === 'string' ? values : null;
      const variables = typeof values === 'object' ? values : {};
      const value = translations[locale.code]?.[key] ?? fallback ?? key;
      return typeof value === 'string'
        ? value.replace(/\{(\w+)\}/g, (_, name) => variables[name] ?? `{${name}}`)
        : value;
    },
    [locale.code]
  );

  const value = useMemo(
    () => ({
      language: locale.code,
      locale,
      setLanguage: (next) => setLanguageState(LANGUAGES.some((item) => item.code === next) ? next : 'en'),
      t,
      weatherTerm: (key) => weatherTerm(locale.code, key),
      alertTerm: (key) => alertTerm(locale.code, key),
      languages: LANGUAGES,
    }),
    [locale, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}

export default LanguageContext;
