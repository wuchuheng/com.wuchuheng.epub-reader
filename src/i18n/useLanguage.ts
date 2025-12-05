import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type SupportedLanguage = 'zh-CN' | 'en';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const normalizedLanguage: SupportedLanguage =
    i18n.language?.startsWith('en') ? 'en' : 'zh-CN';
  const currentLanguage = normalizedLanguage;

  const changeLanguage = useCallback(
    (lang: SupportedLanguage) => {
      i18n.changeLanguage(lang);
    },
    [i18n]
  );

  const toggleLanguage = useCallback(() => {
    const nextLanguage: SupportedLanguage = currentLanguage === 'zh-CN' ? 'en' : 'zh-CN';
    changeLanguage(nextLanguage);
  }, [changeLanguage, currentLanguage]);

  return {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
  };
};
