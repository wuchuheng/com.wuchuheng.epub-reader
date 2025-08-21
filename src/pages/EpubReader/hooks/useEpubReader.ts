import { useEffect, useRef, useState } from 'react';
import { Book, Rendition } from 'epubjs';
import { logger } from '../../../utils/logger';
import { EpubLocation, LocationUtils } from '../../../types/epub';

type EpubReaderResult = {
  rendition: Rendition | null;
  containerRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  error: string | null;
  currentLocation: string | null;
  totalPages: number;
  currentPage: number;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToChapter: (href: string) => void;
  goToPage: (page: number) => void;
  saveReadingPosition: () => void;
};

/**
 * Hook for managing EPUB.js book lifecycle and rendering
 * Handles book loading, rendition creation, and navigation
 */
export const useEpubReader = (book: Book): EpubReaderResult => {
  // 1. State management
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // 2. Refs
  const renditionRef = useRef<Rendition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3. Book loading
  useEffect(() => {
    const loadBook = async () => {
      try {
        setIsLoading(true);
        setError('');

        // 3.4 Generate locations for pagination
        if (!book.locations) return;

        const generatedLocations = await book.locations.generate(1500);
        setTotalPages(generatedLocations.length || 0);
      } catch (err) {
        logger.error('Failed to load book:', err);
        setError(err instanceof Error ? err.message : 'Failed to load book');
      } finally {
        setIsLoading(false);
      }
    };

    loadBook();
  }, []);

  // 4. Rendition creation
  useEffect(() => {
    if (!containerRef.current) return;

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
      renditionInstance.on('relocated', (location: EpubLocation) => {
        setCurrentLocation(location.start.href);
        setCurrentPage(location.start.displayed?.page || 0);
      });

      // 4.3 Load saved location
      const savedLocation = localStorage.getItem(`reading-position-`);
      if (savedLocation) {
        renditionInstance.display(savedLocation);
      } else {
        renditionInstance.display();
      }
    } catch (err) {
      logger.error('Failed to create rendition:', err);
      setError('Failed to initialize reader');
    }
  }, [book]);

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
    if (book.locations) {
      const cfi = (book.locations as unknown as LocationUtils).cfiFromPage(page);
      if (cfi && renditionRef.current) {
        renditionRef.current.display(cfi);
      }
    }
  };

  // 6. Save reading position
  const saveReadingPosition = () => {
    if (currentLocation) {
      localStorage.setItem(`reading-position`, currentLocation);
    }
  };

  // Auto-save position on location change
  useEffect(() => {
    if (currentLocation) {
      saveReadingPosition();
    }
  }, [currentLocation]);

  return {
    rendition,
    containerRef,
    isLoading,
    error,
    currentLocation,
    totalPages,
    currentPage,
    goToNextPage,
    goToPrevPage,
    goToChapter,
    goToPage,
    saveReadingPosition,
  };
};
