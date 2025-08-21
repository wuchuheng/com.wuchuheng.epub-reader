import { useEffect, useState } from 'react';
import { Book } from 'epubjs';
import * as OPFSManager from '../../../services/OPFSManager';
import { logger } from '../../../utils/logger';

/**
 * Hook for loading EPUB books from OPFS
 * Handles file loading, book instantiation, and error states
 */
export const useBookLoader = (bookId: string) => {
  // 1. State management
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Book loading
  useEffect(() => {
    const loadBook = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 2.1 Get book file from OPFS
        const bookFile = await OPFSManager.getBookFile(bookId);

        // 2.2 Create book instance
        const bookInstance = new Book(bookFile);

        // 2.3 Wait for book to be ready
        await bookInstance.ready;

        setBook(bookInstance);
      } catch (err) {
        logger.error('Failed to load book:', err);
        setError(err instanceof Error ? err.message : 'Failed to load book');
      } finally {
        setIsLoading(false);
      }
    };

    if (bookId) {
      loadBook();
    }

    // 3. Cleanup
    return () => {
      if (book) {
        book.destroy();
      }
    };
  }, [bookId, book]);

  return {
    book,
    isLoading,
    error,
  };
};
