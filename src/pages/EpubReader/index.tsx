import React from 'react';
import { useParams } from 'react-router-dom';

/**
 * EPUB reader page component
 * Displays EPUB content with navigation and reading features
 * Placeholder implementation - will be enhanced later
 */
export const EpubReader: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">EPUB Reader</h1>
        <p className="text-gray-600 mb-2">Book ID: {bookId}</p>
        <p className="text-gray-500">EPUB reader implementation coming soon...</p>
      </div>
    </div>
  );
};

// Default export for router
export default EpubReader;
