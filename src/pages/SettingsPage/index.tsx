import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../i18n/useLanguage';

export const GeneralPage: React.FC = () => {
  const { t } = useTranslation('settings');
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">{t('general.title')}</h3>
        <p className="mt-1 text-sm text-gray-500">{t('general.description')}</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-medium text-gray-900">
          {t('general.languageSelection')}
        </h3>
        <p className="mb-3 text-sm text-gray-500">{t('general.languageDescription')}</p>
        <div className="flex gap-3">
          <button
            onClick={() => changeLanguage('zh-CN')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentLanguage === 'zh-CN'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('common:language.zhCN')}
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentLanguage === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('common:language.en')}
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-gray-900">{t('general.comingSoon')}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>{t('general.themeCustomization')}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>{t('general.languageSelection')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralPage;
