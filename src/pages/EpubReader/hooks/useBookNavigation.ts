import { useEffect, useState } from 'react';
import { Book, Location } from 'epubjs';
import { logger } from '../../../utils/logger';
import { BookNavigationResult, TocItem } from '../../../types/epub';

/**
 * Hook for managing book navigation and progress
 * Handles page navigation, progress tracking, and TOC management
 */
export const useBookNavigation = (book: Book): BookNavigationResult => {
  // 1. State management
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentChapter, setCurrentChapter] = useState<string>('');
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([]);

  // 2. Initialize navigation
  useEffect(() => {
    if (!book) return;

    // Load table of contents
    book.loaded.navigation.then((navigation) => {
      setTableOfContents(navigation.toc);
    });

    // 2.2 Generate locations for pagination
    const generateLocations = async () => {
      try {
        const locations = await book.locations.generate(1500);
        setTotalPages(locations.length || 0);
      } catch (err) {
        logger.error('Failed to generate locations:', err);
        setTotalPages(0);
      }
    };

    generateLocations();
  }, [book]);

  const handleRelocated = (location: Location) => {
    if (!location) return;

    // 3.1 Update current page
    const page = location.start?.displayed?.page || 0;
    setCurrentPage(page);

    // 3.2 Update chapter info
    setCurrentChapter(location.start.href);

    // 3.3 Update boundary states
    setIsAtStart(location.atStart || false);
    setIsAtEnd(location.atEnd || false);
  };

  const { rendition } = book;
  // 3. Handle location changes
  useEffect(() => {
    if (!book.rendition) return;

    book.rendition.on('relocated', handleRelocated);

    return () => {
      if (book.rendition) {
        book.rendition.off('relocated', handleRelocated);
      }
    };
  }, [rendition]);

  // 4. Navigation methods
  const goToNextPage = () => {
    if (book.rendition) {
      logger.log('Navigating to next page');
      book.rendition.next();
    }
  };

  const goToPrevPage = () => {
    if (book.rendition) {
      book.rendition.prev();
    }
  };

  const goToChapter = (href: string) => {
    if (book.rendition) {
      book.rendition.display(href);
    }
  };

  const goToPage = (page: number) => {
    if (book && book.locations) {
      try {
        const cfi = (
          book.locations as unknown as { cfiFromPage: (page: number) => string }
        ).cfiFromPage(page);
        if (cfi && book.rendition) {
          book.rendition.display(cfi);
        }
      } catch (err) {
        logger.error('Failed to navigate to page:', err);
      }
    }
  };

  const goToPercentage = (percentage: number) => {
    if (book && book.locations && totalPages > 0) {
      const page = Math.floor((percentage / 100) * totalPages);
      goToPage(page);
    }
  };

  return {
    currentPage,
    totalPages,
    tableOfContents,
    currentChapter,
    isAtStart,
    isAtEnd,
    goToNextPage,
    goToPrevPage,
    goToChapter,
    goToPage,
    goToPercentage,
  };
};
