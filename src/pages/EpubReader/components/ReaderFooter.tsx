import React from 'react';
import { Rendition } from 'epubjs';
import { BookNavigationResult } from '../../../types/epub';
import * as Icons from '../../../components/icons';

interface ReaderFooterProps {
  navigation: BookNavigationResult;
  rendition: Rendition | null;
  currentLocation: string | null;
  goToChapter?: (href: string) => void;
}

/**
 * Reader footer component with progress bar and navigation controls
 * Implements the bottom navigation area from DESIGN.md
 */
export const ReaderFooter: React.FC<ReaderFooterProps> = (props) => {
  const progress =
    props.navigation.totalPages > 0
      ? Math.round(((props.navigation.currentPage + 1) / props.navigation.totalPages) * 100)
      : 0;

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Progress Bar */}
          <div className="flex-1 mr-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>
                Page {props.navigation.currentPage + 1} of {props.navigation.totalPages}
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
              onClick={props.navigation.goToPrevPage}
              disabled={props.navigation.isAtStart}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <Icons.LeftArrow />
            </button>
            <button
              onClick={props.navigation.goToNextPage}
              disabled={props.navigation.isAtEnd}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <Icons.RightArrow />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
