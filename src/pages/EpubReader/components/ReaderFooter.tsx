import React from 'react';
import { Book, Rendition } from 'epubjs';
import { BookNavigationResult } from '../../../types/epub';

/**
 * Reader instance interface combining book state with navigation methods
 */
interface ReaderInstance {
  book: Book | null;
  rendition: Rendition | null;
  isLoading: boolean;
  error: string | null;
  currentLocation: string | null;
  goToChapter?: (href: string) => void;
}

interface ReaderFooterProps {
  reader: ReaderInstance;
  navigation: BookNavigationResult;
}

/**
 * Reader footer component with progress bar and navigation controls
 * Implements the bottom navigation area from DESIGN.md
 */
export const ReaderFooter: React.FC<ReaderFooterProps> = ({ reader, navigation }) => {
  if (reader.isLoading || reader.error) return null;

  const progress =
    navigation.totalPages > 0
      ? Math.round(((navigation.currentPage + 1) / navigation.totalPages) * 100)
      : 0;

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Progress Bar */}
          <div className="flex-1 mr-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>
                Page {navigation.currentPage + 1} of {navigation.totalPages}
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
              onClick={navigation.goToPrevPage}
              disabled={navigation.isAtStart}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={navigation.goToNextPage}
              disabled={navigation.isAtEnd}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
