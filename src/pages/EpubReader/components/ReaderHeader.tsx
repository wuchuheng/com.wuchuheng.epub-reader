import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as Icons from '../../../components/icons';
import { usePWAInstall } from '../../../hooks/usePWAInstall';

interface ReaderHeaderProps {
  visible: boolean;
  onOpenToc: () => void;
  onHelpClick: () => void;
}

/**
 * Reader header component with navigation controls
 * Implements the top menu bar from DESIGN.md specifications
 */
export const ReaderHeader: React.FC<ReaderHeaderProps> = (props) => {
  const { t } = useTranslation('reader');
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // access navigator hooks from react-router.
  const navigate = useNavigate();
  const { isStandalone } = usePWAInstall();

  return (
    <header
      className={`absolute left-0 right-0 top-0 z-50 transform border-b bg-white shadow-sm transition-transform duration-300 ease-in-out ${props.visible ? 'translate-y-0' : '-translate-y-full'} `}
    >
      <div className="mx-auto max-w-4xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-600 hover:text-gray-900"
              title={t('header.toc')}
              aria-label={t('header.toc')}
              onClick={props.onOpenToc}
            >
              <Icons.Menu />
            </button>
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 hover:text-gray-900"
              aria-label={t('header.home')}
              title={t('header.home')}
            >
              <Icons.Home />
            </button>

            <button
              onClick={() => console.log('Search coming soon')}
              className="p-2 text-gray-600 hover:text-gray-900"
              title={t('header.search')}
              aria-label={t('header.search')}
            >
              <Icons.Search />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold text-gray-900">{t('header.title')}</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={props.onHelpClick}
              className="p-2 text-gray-600 hover:text-gray-900"
              title={t('header.help')}
              aria-label={t('header.help')}
            >
              <Icons.QuestionMark />
            </button>
            {!isStandalone && (
              <button
                onClick={handleFullscreen}
                className="p-2 text-gray-600 hover:text-gray-900"
                title={t('header.fullscreen')}
                aria-label={t('header.fullscreen')}
              >
                <Icons.Fullscreen />
              </button>
            )}
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-gray-600 hover:text-gray-900"
              title={t('header.settings')}
              aria-label={t('header.settings')}
            >
              <Icons.Settings />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
