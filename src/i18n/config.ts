import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import commonZh from './locales/zh-CN/common.json';
import homepageZh from './locales/zh-CN/homepage.json';
import readerZh from './locales/zh-CN/reader.json';
import settingsZh from './locales/zh-CN/settings.json';
import errorsZh from './locales/zh-CN/errors.json';

import commonEn from './locales/en/common.json';
import homepageEn from './locales/en/homepage.json';
import readerEn from './locales/en/reader.json';
import settingsEn from './locales/en/settings.json';
import errorsEn from './locales/en/errors.json';

const resources = {
  'zh-CN': {
    common: commonZh,
    homepage: homepageZh,
    reader: readerZh,
    settings: settingsZh,
    errors: errorsZh,
  },
  en: {
    common: commonEn,
    homepage: homepageEn,
    reader: readerEn,
    settings: settingsEn,
    errors: errorsEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-CN',
    defaultNS: 'common',
    ns: ['common', 'homepage', 'reader', 'settings', 'errors'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'epub-reader-lang',
    },
  });

export default i18n;
