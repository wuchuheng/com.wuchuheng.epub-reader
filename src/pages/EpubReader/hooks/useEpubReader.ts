import { useEffect, useRef, useState } from 'react';
import { Book, Rendition } from 'epubjs';
import * as OPFSManager from '../../../services/OPFSManager';
import { logger } from '../../../utils/logger';

/**
 * Hook for managing EPUB.js book lifecycle and rendering
 * Handles book loading, rendition creation, and navigation
 */
export const useEpubReader = (bookId: string) => {
  // 1. State management
  const [book, setBook] = useState<Book | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // 2. Refs
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3. Book loading
  useEffect(() => {
    const loadBook = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 3.1 Get book file from OPFS
        const bookFile = await OPFSManager.getBookFile(bookId);
        
        // 3.2 Create book instance
        const bookInstance = new Book(bookFile);
        
        bookRef.current = bookInstance;
        setBook(bookInstance);

        // 3.3 Wait for book to be ready
        await bookInstance.ready;
        
        // 3.4 Generate locations for pagination
        const locations = await bookInstance.locations.generate(1500);
        setTotalPages(locations.length || 0);

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

    // Cleanup
    return () => {
      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
  }, [bookId]);

  // 4. Rendition creation
  useEffect(() => {
    if (!book || !containerRef.current) return;

    try {
      // 4.1 Create rendition
      const renditionInstance = book.renderTo(containerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'auto',
        minSpreadWidth: 800,
      });

      renditionRef.current = renditionInstance;
      setRendition(renditionInstance);

      // 4.2 Location change handler
      renditionInstance.on('relocated', (location: any) => {
        setCurrentLocation(location.start.href);
        setCurrentPage(location.start.displayed.page || 0);
      });

      // 4.3 Load saved location
      const savedLocation = localStorage.getItem(`reading-position-${bookId}`);
      if (savedLocation) {
        renditionInstance.display(savedLocation);
      } else {
        renditionInstance.display();
      }

    } catch (err) {
      logger.error('Failed to create rendition:', err);
      setError('Failed to initialize reader');
    }
  }, [book, bookId]);

  // 5. Navigation methods
  const goToNextPage = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  const goToPrevPage = () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

  const goToChapter = (href: string) => {
    if (renditionRef.current) {
      renditionRef.current.display(href);
    }
  };

  const goToPage = (page: number) => {
    if (bookRef.current && bookRef.current.locations) {
      const cfi = (bookRef.current.locations as any).cfiFromPage(page);
      if (cfi && renditionRef.current) {
        renditionRef.current.display(cfi);
      }
    }
  };

  // 6. Save reading position
  const saveReadingPosition = () => {
    if (currentLocation && bookId) {
      localStorage.setItem(`reading-position-${bookId}`, currentLocation);
    }
  };

  // Auto-save position on location
