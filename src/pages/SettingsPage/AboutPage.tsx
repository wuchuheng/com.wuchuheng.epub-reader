import React from 'react';
import { useTranslation } from 'react-i18next';
import { CHANGELOG_CONFIG, LATEST_CHANGELOG } from '../../config/changelog';
import { type ChangelogCategory, type ChangelogVersion } from '../../types/changelog';
import LogoSvg from '../../assets/logo.svg';
import { FaAngleRight } from 'react-icons/fa6';

const categoryOrder: ChangelogCategory[] = [
  'feat',
  'fix',
  'refactor',
  'docs',
  'chore',
  'perf',
  'style',
];

interface ChangelogItemProps {
  version: ChangelogVersion;
  isOpen: boolean;
  onToggle: (version: string) => void;
  getCategoryLabel: (category: ChangelogCategory) => string;
  expandLabel: string;
  collapseLabel: string;
}

const ChangelogItem: React.FC<ChangelogItemProps> = ({
  version,
  isOpen,
  onToggle,
  getCategoryLabel,
  expandLabel,
  collapseLabel,
}) => {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = React.useState('0px');
  const [isAnimating, setIsAnimating] = React.useState(false);
  const headerClassName = [
    'flex w-full items-center justify-between gap-3 bg-white px-4 py-3 text-left',
    'transition hover:bg-gray-50',
  ].join(' ');
  const iconClassName = [
    'flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-600',
    'transition hover:bg-gray-100',
  ].join(' ');

  React.useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    const node = contentRef.current;
    const height = node.scrollHeight;
    const transitionDurationMs = 300;

    if (isOpen) {
      setIsAnimating(true);
      setMaxHeight(`${height}px`);
      const timer = window.setTimeout(() => {
        setMaxHeight('none');
        setIsAnimating(false);
      }, transitionDurationMs);

      return () => window.clearTimeout(timer);
    }

    setIsAnimating(true);
    setMaxHeight(`${height}px`);
    const frame = window.requestAnimationFrame(() => {
      setMaxHeight('0px');
    });
    const timer = window.setTimeout(() => setIsAnimating(false), transitionDurationMs);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [isOpen, version]);

  const nonEmptyCategories = categoryOrder.filter(
    (category) => version.changes[category] && version.changes[category].length > 0
  );

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle(version.version)}
        aria-expanded={isOpen}
        aria-label={isOpen ? collapseLabel : expandLabel}
        className={headerClassName}
      >
        <div className="flex items-center gap-3">
          <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
            v{version.version}
          </span>
          <span className="text-xs text-gray-500">{version.releasedAt}</span>
        </div>
        <span aria-hidden="true" className={iconClassName}>
          <FaAngleRight
            className={`text-lg transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
          />
        </span>
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden px-4 transition-all duration-300 ease-in-out"
        style={{
          maxHeight,
          opacity: isOpen || isAnimating ? 1 : 0,
          paddingTop: isOpen ? '0.75rem' : 0,
          paddingBottom: isOpen ? '1rem' : 0,
        }}
      >
        <p className="text-sm text-gray-600">{version.summary}</p>
        <div className="mt-4 space-y-4">
          {nonEmptyCategories.map((category) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                  {getCategoryLabel(category)}
                </span>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {version.changes[category].map((entry) => (
                  <li key={entry.title} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
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
  );
};

export const AboutPage: React.FC = () => {
  const { t } = useTranslation('settings');
  const [expandedVersions, setExpandedVersions] = React.useState<Set<string>>(
    () => new Set([LATEST_CHANGELOG.version])
  );

  const getCategoryLabel = (category: ChangelogCategory) => t(`about.categories.${category}`);
  const toggleVersion = (version: string) => {
    setExpandedVersions((current) => {
      const next = new Set(current);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }

      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-10 p-8">
        {/* Header Section with Logo and Title */}
        <div className="flex flex-col items-center gap-6">
          <img src={LogoSvg} alt="App Logo" className="h-24 w-24" />
          <div className="space-y-2 text-center">
            <h4 className="text-2xl font-semibold text-gray-900">{t('about.title')}</h4>
            <p className="text-base text-gray-600">{t('about.description')}</p>
          </div>

          <p className="inline-block flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">{t('about.author')}:</span> wuchuheng
            <a href="mailto:root@wuchuheng.com" className="text-blue-600 hover:underline">
              root@wuchuheng.com
            </a>
          </p>
        </div>

        <div className="flex justify-center border-t border-gray-200 pt-8"></div>

        <div className="mt-8 space-y-4">
          <h5 className="text-lg font-semibold text-gray-900">{t('about.changelogHistory')}</h5>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            {CHANGELOG_CONFIG.map((version) => (
              <ChangelogItem
                key={version.version}
                version={version}
                isOpen={expandedVersions.has(version.version)}
                onToggle={toggleVersion}
                getCategoryLabel={getCategoryLabel}
                expandLabel={t('about.expand')}
                collapseLabel={t('about.collapse')}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
