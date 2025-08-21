import React from 'react';
import * as Icons from '../../../components/icons';

interface ReaderHeaderProps {
  isTocOpen: boolean;
  setIsTocOpen: (open: boolean) => void;
  setIsFullscreen: (fullscreen: boolean) => void;
}

/**
 * Reader header component with navigation controls
 * Implements the top menu bar from DESIGN.md specifications
 */
export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  isTocOpen,
  setIsTocOpen,
  setIsFullscreen,
}) => {
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsTocOpen(!isTocOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Table of Contents"
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
    </div>
  );
};
