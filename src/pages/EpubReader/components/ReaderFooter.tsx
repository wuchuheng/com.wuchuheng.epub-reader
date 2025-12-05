import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from '../../../components/icons';

interface ReaderFooterProps {
  visible: boolean;
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
}

/**
 * Reader footer component with progress bar and navigation controls
 * Implements the bottom navigation area from DESIGN.md
 */
export const ReaderFooter: React.FC<ReaderFooterProps> = (props) => {
  const { t } = useTranslation('reader');
  const progress =
    props.totalPages > 0 ? Math.round(((props.currentPage + 1) / props.totalPages) * 100) : 0;

  return (
    <footer
      className={`absolute bottom-0 left-0 right-0 z-50 transform border-b bg-white shadow-sm transition-transform duration-300 ease-in-out ${props.visible ? 'block translate-y-0' : 'hidden'} `}
    >
      <div className="mx-auto max-w-4xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Progress Bar */}
          <div className="mr-4 flex-1">
            <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
              <span>
                {t('footer.pageStatus', {
                  current: props.currentPage + 1,
                  total: props.totalPages,
                })}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={props.onPrev}
              // disabled={props.navigation.isAtStart}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              title={t('common:previousPage')}
            >
              <Icons.LeftArrow />
            </button>
            <button
              onClick={props.onNext}
              // disabled={props.navigation.isAtEnd}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              title={t('common:nextPage')}
            >
              <Icons.RightArrow />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
