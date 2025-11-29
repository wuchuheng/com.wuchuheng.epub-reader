import React from 'react';
import { CHANGELOG_CONFIG, LATEST_CHANGELOG } from '../../config/changelog';
import { type ChangelogCategory, type ChangelogEntry, type ChangelogVersion } from '../../types/changelog';

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

type CategoryCardProps = {
  category: ChangelogCategory;
  entries: ChangelogEntry[];
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category, entries }) => (
  <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
    <div className="mb-3 flex items-center gap-2">
      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
        {categoryLabels[category]}
      </span>
      <span className="text-xs text-gray-500">{entries.length} item{entries.length === 1 ? '' : 's'}</span>
    </div>
    <ul className="space-y-2 text-sm text-gray-700">
      {entries.map((entry) => (
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
);

const VersionMeta: React.FC<{ version: ChangelogVersion }> = ({ version }) => (
  <div className="flex flex-wrap items-center gap-3">
    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
      v{version.version}
    </span>
    <span className="text-xs text-gray-500">Released {version.releasedAt}</span>
  </div>
);

export const ChangelogPage: React.FC = () => {
  const previousVersions = CHANGELOG_CONFIG.slice(1);
  const nonEmptyCategories = categoryOrder.filter(
    (category) => LATEST_CHANGELOG.changes[category] && LATEST_CHANGELOG.changes[category].length > 0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Changelog</h3>
        <p className="mt-1 text-sm text-gray-500">
          Highlights of the latest release and a quick look at earlier versions.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <VersionMeta version={LATEST_CHANGELOG} />
            <p className="text-base font-semibold text-gray-900">{LATEST_CHANGELOG.summary}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {nonEmptyCategories.map((category) => (
            <CategoryCard key={category} category={category} entries={LATEST_CHANGELOG.changes[category]} />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-gray-900">Previous versions</h4>
          <span className="text-xs text-gray-500">
            {previousVersions.length === 0 ? 'No earlier versions recorded yet.' : `${previousVersions.length} listed`}
          </span>
        </div>
        {previousVersions.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">
            v{LATEST_CHANGELOG.version} is the first published changelog entry for this project.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {previousVersions.map((version) => (
              <div key={version.version} className="rounded-md border border-gray-100 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <VersionMeta version={version} />
                    <p className="text-sm font-medium text-gray-900">{version.summary}</p>
                  </div>
                  <span className="text-xs text-gray-500">{version.changes.feat.length} featured updates</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangelogPage;
