import React from 'react';
import * as Icons from '../../../components/icons';

interface ReaderFooterProps {
  visible: boolean;
  currentPage: number;
  totalPages: number;
}

/**
 * Reader footer component with progress bar and navigation controls
 * Implements the bottom navigation area from DESIGN.md
 */
export const ReaderFooter: React.FC<ReaderFooterProps> = (props) => {
  const progress =
    props.totalPages > 0 ? Math.round(((props.currentPage + 1) / props.totalPages) * 100) : 0;

  return (
    <footer
      className={`
        bg-white border-b shadow-sm absolute bottom-0 left-0 right-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${props.visible ? 'translate-y-0 block' : 'hidden'}
      `}
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Progress Bar */}
          <div className="flex-1 mr-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>
                Page {props.currentPage + 1} of {props.totalPages}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              // onClick={props.navigation.goToPrevPage}
              // disabled={props.navigation.isAtStart}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <Icons.LeftArrow />
            </button>
            <button
              // onClick={props.navigation.goToNextPage}
              // disabled={props.navigation.isAtEnd}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <Icons.RightArrow />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
