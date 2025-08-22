import { useEffect, useRef, useState } from 'react';
import { Book, Rendition } from 'epubjs';
import { logger } from '../../../utils/logger';
import { EpubLocation, LocationUtils } from '../../../types/epub';

// Type for the location object from rendition's 'relocated' event
type RenditionLocation = {
  start: {
    index: number;
    href: string;
    cfi: string;
    location: number;
    percentage: number;
    displayed: {
      page: number;
      total: number;
    };
  };
  end: {
    index: number;
    href: string;
    cfi: string;
    location: number;
    percentage: number;
    displayed: {
      page: number;
      total: number;
    };
  };
  atStart: boolean;
  atEnd: boolean;
};

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
        manager: 'continuous',
        allowScriptedContent: true,
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

type UseReaderReturn = {
  containerRef: React.RefObject<HTMLDivElement>;
  onNext: () => void;
  onPrev: () => void;
};

type UseReaderProps = {
  book: Book;
};
export const useReader = (props: UseReaderProps): UseReaderReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onNextRef = useRef<() => void>(() => {});
  const onPrevRef = useRef<() => void>(() => {});
  const currentRenditionLocationRef = useRef<RenditionLocation | null>(null); // Ref to store the latest location object

  const onRenderBook = () => {
    logger.log('Rendering book:', props.book);
    // 2. Handle logic.
    // 2.1 Render book.
    const rendition = props.book.renderTo(containerRef.current!, {
      width: '100%',
      height: '100%',
      spread: 'auto',
      minSpreadWidth: 800,
      manager: 'continuous',
      allowScriptedContent: true,
    });

    // 2.2 Display first page.
    rendition.display();

    // Listen to 'relocated' event to update the location ref
    rendition.on('relocated', (location: RenditionLocation) => {
      currentRenditionLocationRef.current = location;
    });

    // 2.3 Bind navigation events.
    props.book.ready.then(() => {
      logger.log('Book is ready:', props.book);

      // 2.2.1 Bind next event.
      onNextRef.current = () => {
        // 1. Check if the latest page is displayed using the ref
        if (currentRenditionLocationRef.current?.atEnd) {
          logger.warn('Reached the end of the book');
          return;
        }

        rendition.next();
      };

      onPrevRef.current = () => {
        // 1. Check if the latest page is displayed using the ref
        if (currentRenditionLocationRef.current?.atStart) {
          logger.warn('Reached the start of the book');
          return;
        }

        rendition.prev();
      };
    });
  };

  // Bind the direction keys
  useEffect(() => {
    const keyListener = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onPrevRef.current?.();
      }
      if (e.key === 'ArrowRight') {
        onNextRef.current?.();
      }
    };

    document.addEventListener('keydown', keyListener);
    return () => {
      document.removeEventListener('keydown', keyListener);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      logger.log('Container ref is set:', containerRef.current);
      onRenderBook();
    }
  }, [props.book, containerRef]);

  return {
    containerRef,
    onNext: onNextRef.current,
    onPrev: onPrevRef.current,
  };
};
