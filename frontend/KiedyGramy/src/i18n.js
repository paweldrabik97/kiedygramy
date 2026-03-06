import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import commonPl from './locales/pl/common.json';
import commonEn from './locales/en/common.json';

const resources = {
  pl: {
    common: commonPl,
  },
  en: {
    common: commonEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pl',
    debug: false,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    
  });

export default i18n;
