import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import translations, { LANGUAGES } from '../i18n/translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'weathergpt.language';

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem(STORAGE_KEY) || 'en');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  // Missing keys fall back to English so a partial translation never breaks a page.
  const t = useCallback(
    (key, fallback) => translations[language]?.[key] ?? translations.en[key] ?? fallback ?? key,
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage: setLanguageState, t, languages: LANGUAGES }),
    [language, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}

export default LanguageContext;
