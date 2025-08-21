import React from 'react';
import { useEpubReader } from '../hooks/useEpubReader';

/**
 * Main EPUB reader view component
 * Handles the actual EPUB rendering and display
 */
interface ReaderViewProps {
  bookId: string;
}

export const ReaderView: React.FC<ReaderViewProps> = ({ bookId }) => {
  // 1. Use the epub reader hook
  const { containerRef, isLoading, error } = useEpubReader(bookId);

  // 2. Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

  // 3. Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Book</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 4. Main reader view
  return (
    <div className="flex-1 relative bg-white">
      {/* EPUB.js will render into this container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          minHeight: 'calc(100vh - 4rem)', // Account for navigation bar
        }}
      />

      {/* Reader overlay for interactions */}
      <div className="absolute inset-0 pointer-events-none">
        {/* This space can be used for overlays, selection menus, etc. */}
      </div>
    </div>
  );
};
