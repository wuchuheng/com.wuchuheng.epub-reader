import React from 'react';

/**
 * Navigation controls for page navigation
 */
interface NavigationControlsProps {
  onPrevPage: () => void;
  onNextPage: () => void;
  isAtStart: boolean;
  isAtEnd: boolean;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPrevPage,
  onNextPage,
  isAtStart,
  isAtEnd,
}) => (
  <div className="flex items-center space-x-4">
    <button
      onClick={onPrevPage}
      disabled={isAtStart}
      className={`
          p-2 rounded transition-colors
          ${isAtStart ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}
        `}
      aria-label="Previous page"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <button
      onClick={onNextPage}
      disabled={isAtEnd}
      className={`
          p-2 rounded transition-colors
          ${isAtEnd ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}
        `}
      aria-label="Next page"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
);
