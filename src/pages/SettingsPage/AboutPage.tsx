import React from 'react';
import { useTranslation } from 'react-i18next';
import { CHANGELOG_CONFIG, LATEST_CHANGELOG } from '../../config/changelog';
import { type ChangelogCategory } from '../../types/changelog';

const categoryOrder: ChangelogCategory[] = [
  'feat',
  'fix',
  'refactor',
  'docs',
  'chore',
  'perf',
  'style',
];

export const AboutPage: React.FC = () => {
  const { t } = useTranslation('settings');

  const getCategoryLabel = (category: ChangelogCategory) =>
    t(`about.categories.${category}`);

  return (
    <div className="space-y-6">
      <div className="space-y-6 border-gray-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-3">
            <div>
              <h4 className="text-base font-semibold text-gray-900">{t('about.title')}</h4>
              <p className="mt-1 text-sm text-gray-500">{t('about.description')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                v{LATEST_CHANGELOG.version}
              </span>
              <span>{t('about.released', { date: LATEST_CHANGELOG.releasedAt })}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{LATEST_CHANGELOG.summary}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">{t('about.builtWith')}</p>
        </div>

        <div className="mt-8 space-y-8">
          <h5 className="text-lg font-semibold text-gray-900">{t('about.changelogHistory')}</h5>
          <div className="space-y-8">
            {CHANGELOG_CONFIG.map((version) => {
              const nonEmptyCategories = categoryOrder.filter(
                (category) =>
                  version.changes[category] && version.changes[category].length > 0
              );

              return (
                <div key={version.version} className="space-y-4 border-l-2 border-gray-100 pl-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">v{version.version}</span>
                      <span className="text-xs text-gray-500">· {version.releasedAt}</span>
                    </div>
                    <p className="text-sm text-gray-600">{version.summary}</p>
                  </div>

                  <div className="space-y-4">
                    {nonEmptyCategories.map((category) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            {getCategoryLabel(category)}
                          </span>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {version.changes[category].map((entry) => (
                            <li key={entry.title} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                              <div>
                                <p className="font-medium text-gray-900">{entry.title}</p>
                                {entry.description ? (
                                  <p className="text-gray-600">{entry.description}</p>
                                ) : null}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
