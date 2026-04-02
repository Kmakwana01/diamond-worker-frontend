import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import gu from '../locales/gu.json';
import hi from '../locales/hi.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      gu: { translation: gu },
      hi: { translation: hi },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // ✅ MUST be false for React
    },
    react: {
      useSuspense: false,
    },
    compatibilityJSON: 'v3', // ✅ Important for i18next v21+
  });

export default i18n;
