import React from 'react';
import * as Icons from '../../../components/icons';

interface ReaderHeaderProps {
  visible: boolean;
  onOpenToc: () => void;
}

/**
 * Reader header component with navigation controls
 * Implements the top menu bar from DESIGN.md specifications
 */
export const ReaderHeader: React.FC<ReaderHeaderProps> = (props) => {
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header
      className={`
        bg-white border-b shadow-sm absolute top-0 left-0 right-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${props.visible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between ">
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-600 hover:text-gray-900"
              title="Table of Contents"
              onClick={props.onOpenToc}
            >
              <Icons.Menu />
            </button>
            <button
              onClick={() => console.log('Search coming soon')}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Search"
            >
              <Icons.Search />
            </button>
            <button
              onClick={() => (window.location.href = '/settings')}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Settings"
            >
              <Icons.Settings />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold text-gray-900">EPUB Reader</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Fullscreen"
            >
              <Icons.Fullscreen />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
