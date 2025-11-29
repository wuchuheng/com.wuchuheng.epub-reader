import React from 'react';

/**
 * Loading component for the EPUB reader
 * @returns Loading component for the EPUB reader
 */
export const Loading: React.FC = () => (
  <div className="flex flex-1 items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      <p className="text-gray-600">Loading book...</p>
    </div>
  </div>
);
