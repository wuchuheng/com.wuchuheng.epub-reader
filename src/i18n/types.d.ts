import 'react-i18next';
import common from './locales/zh-CN/common.json';
import homepage from './locales/zh-CN/homepage.json';
import reader from './locales/zh-CN/reader.json';
import settings from './locales/zh-CN/settings.json';
import errors from './locales/zh-CN/errors.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      homepage: typeof homepage;
      reader: typeof reader;
      settings: typeof settings;
      errors: typeof errors;
    };
  }
}
