import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReaderHeader } from './components/ReaderHeader';
import { ReaderContent } from './components/ReaderContent';
import { useEpubReader } from './hooks/useEpubReader';
import { useBookNavigation } from './hooks/useBookNavigation';

/**
 * Complete EPUB reader page component
 * Integrates all reader components into a cohesive reading experience
 * Follows the design specifications from DESIGN.md
 */
export const EpubReader: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Core reader state
  const reader = useEpubReader(bookId || '');
  const navigation = useBookNavigation(reader.book, reader.rendition);

  if (!bookId) return <InvalidBookError />;

  return (
    <div className="h-screen bg-white flex flex-col">
      <ReaderHeader
        isTocOpen={isTocOpen}
        setIsTocOpen={setIsTocOpen}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
      />
      <ReaderContent
        bookId={bookId}
        book={reader.book}
        reader={reader}
        navigation={navigation}
        isTocOpen={isTocOpen}
        setIsTocOpen={setIsTocOpen}
      />
    </div>
  );
};

// Sub-components to keep main function under 70 lines
const InvalidBookError: React.FC = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Book ID</h1>
      <p className="text-gray-600">Please select a valid book to read.</p>
    </div>
  </div>
);
