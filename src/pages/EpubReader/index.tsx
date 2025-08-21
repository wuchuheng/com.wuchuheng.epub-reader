import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReaderHeader } from './components/ReaderHeader';
import { ReaderContent } from './components/ReaderContent';
import { Book } from 'epubjs';
import { Loading } from './components/Loading';
import { getBookByBookId } from '../../services/EPUBMetadataService';

/**
 * Complete EPUB reader page component
 * Integrates all reader components into a cohesive reading experience
 * Follows the design specifications from DESIGN.md
 */
export const EpubReader: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;
    getBookByBookId(bookId)
      .then(setBook)
      .catch((err) => {
        console.error('Failed to load book:', err);
        setError('Failed to load book. Please try again later.');
      });
    return () => {
      book?.destroy();
      setBook(null);
    };
  }, [bookId]);
  if (!bookId || error) return <InvalidBookError error={error} />;
  if (!book) return <Loading />;

  return <EpubReaderRender book={book!} />;
};

type EpubReaderRenderProps = {
  book: Book;
};
type EpubReaderMenuConfig = {
  isTocOpen: boolean;
  isFullscreen: boolean;
};

const EpubReaderRender: React.FC<EpubReaderRenderProps> = (props) => {
  const [menuConfig, setMenuConfig] = useState<EpubReaderMenuConfig>({
    isTocOpen: false,
    isFullscreen: false,
  });

  return (
    <div className="h-screen bg-white flex flex-col">
      <ReaderHeader
        isTocOpen={menuConfig.isTocOpen}
        setIsTocOpen={(isOpen) => setMenuConfig((prev) => ({ ...prev, isTocOpen: isOpen }))}
        setIsFullscreen={(isFullscreen) => setMenuConfig((prev) => ({ ...prev, isFullscreen }))}
      />
      <ReaderContent
        book={props.book}
        // reader={reader}
        // navigation={navigation}
        isTocOpen={menuConfig.isTocOpen}
        setIsTocOpen={(isOpen) => setMenuConfig((prev) => ({ ...prev, isTocOpen: isOpen }))}
      />
    </div>
  );
};

// Sub-components to keep main function under 70 lines
type InvalidBookErrorProps = {
  error?: string | null;
};
const InvalidBookError: React.FC<InvalidBookErrorProps> = ({ error }) => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Book ID</h1>
      <p className="text-gray-600">Please select a valid book to read.</p>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  </div>
);
