import React from 'react';

/**
 * Loading component for the EPUB reader
 * @returns Loading component for the EPUB reader
 */
export const Loading: React.FC = () => (
  <div className="flex-1 flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading book...</p>
    </div>
  </div>
);
