import React from 'react';
import { useTranslation } from 'react-i18next';
import I18nSvg from '../I18nSvg';
import { useLanguage } from '../../i18n/useLanguage';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { t } = useTranslation('common');
  const { currentLanguage, toggleLanguage } = useLanguage();

  const languageLabel =
    currentLanguage === 'zh-CN' ? t('language.zhCN') : t('language.en');

  return (
    <button
      onClick={toggleLanguage}
      className={`text-gray-600 hover:text-gray-900 ${className}`}
      aria-label={t('language.switchAria', { language: languageLabel })}
      title={t('language.currentLabel', { language: languageLabel })}
    >
      <I18nSvg />
    </button>
  );
};

export default LanguageSwitcher;
