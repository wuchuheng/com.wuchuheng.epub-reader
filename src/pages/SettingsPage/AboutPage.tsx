import React from 'react';
import { Link } from 'react-router-dom';
import { LATEST_CHANGELOG } from '../../config/changelog';
import { type ChangelogCategory } from '../../types/changelog';

const categoryLabels: Record<ChangelogCategory, string> = {
  feat: 'Features',
  fix: 'Fixes',
  refactor: 'Refactors',
  docs: 'Docs',
  chore: 'Chores',
  perf: 'Performance',
  style: 'Style',
};

const categoryOrder: ChangelogCategory[] = ['feat', 'fix', 'refactor', 'docs', 'chore', 'perf', 'style'];

export const AboutPage: React.FC = () => {
  const nonEmptyCategories = categoryOrder.filter(
    (category) => LATEST_CHANGELOG.changes[category] && LATEST_CHANGELOG.changes[category].length > 0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">About</h3>
        <p className="mt-1 text-sm text-gray-500">Information about the application.</p>
      </div>

      <div className="rounded-lg border border-gray-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-3">
            <div>
              <h4 className="text-base font-semibold text-gray-900">Immersive Reader</h4>
              <p className="mt-1 text-sm text-gray-500">
                An offline-first EPUB reader with AI-powered context enhancements.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                v{LATEST_CHANGELOG.version}
              </span>
              <span>Released {LATEST_CHANGELOG.releasedAt}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{LATEST_CHANGELOG.summary}</p>
          </div>
          <Link
            to="/settings/changelog"
            className="inline-flex items-center rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
          >
            View full changelog
          </Link>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">Built with React, TypeScript, and Tailwind CSS.</p>
        </div>

        <div className="mt-6 space-y-3">
          <h5 className="text-sm font-semibold text-gray-900">What changed in v{LATEST_CHANGELOG.version}</h5>
          <div className="grid gap-3 md:grid-cols-2">
            {nonEmptyCategories.map((category) => (
              <div key={category} className="rounded-md border border-gray-100 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">{categoryLabels[category]}</span>
                  <span className="text-xs text-gray-500">
                    {LATEST_CHANGELOG.changes[category].length} item
                    {LATEST_CHANGELOG.changes[category].length === 1 ? '' : 's'}
                  </span>
                </div>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                  {LATEST_CHANGELOG.changes[category].map((entry) => (
                    <li key={entry.title} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">{entry.title}</p>
                        {entry.description ? <p className="text-gray-600">{entry.description}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
