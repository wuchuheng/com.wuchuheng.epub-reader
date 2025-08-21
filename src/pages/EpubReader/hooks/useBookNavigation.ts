import { useEffect, useState } from 'react';
import { Book, Rendition } from 'epubjs';
import { logger } from '../../../utils/logger';
import { TocItem, BookNavigationResult } from '../../../types/epub';

/**
 * Hook for managing book navigation and progress
 * Handles page navigation, progress tracking, and TOC management
 */
export const useBookNavigation = (
  book: Book | null,
  rendition: Rendition | null
): BookNavigationResult => {
  // 1. State management
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([]);
  const [currentChapter, setCurrentChapter] = useState<string | null>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // 2. Initialize navigation
  useEffect(() => {
    if (!book) return;

    // 2.1 Load table of contents
    const loadTOC = async () => {
      try {
        const navigation = await book.loaded.navigation;
        setTableOfContents(navigation.toc || []);
      } catch (err) {
        logger.error('Failed to load TOC:', err);
      }
    };

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

    loadTOC();
    generateLocations();
  }, [book]);

  // 3. Handle location changes
  useEffect(() => {
    if (!rendition) return;

    const handleRelocated = (location: {
      start?: { href?: string; displayed?: { page?: number } };
      atStart?: boolean;
      atEnd?: boolean;
    }) => {
      if (!location) return;

      // 3.1 Update current page
      const page = location.start?.displayed?.page || 0;
      setCurrentPage(page);

      // 3.2 Update chapter info
      setCurrentChapter(location.start?.href || null);

      // 3.3 Update boundary states
      setIsAtStart(location.atStart || false);
      setIsAtEnd(location.atEnd || false);
    };

    rendition.on('relocated', handleRelocated);

    return () => {
      if (rendition) {
        rendition.off('relocated', handleRelocated);
      }
    };
  }, [rendition]);

  // 4. Navigation methods
  const goToNextPage = () => {
    if (rendition) {
      rendition.next();
    }
  };

  const goToPrevPage = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  const goToChapter = (href: string) => {
    if (rendition) {
      rendition.display(href);
    }
  };

  const goToPage = (page: number) => {
    if (book && book.locations) {
      try {
        const cfi = (
          book.locations as unknown as { cfiFromPage: (page: number) => string }
        ).cfiFromPage(page);
        if (cfi && rendition) {
          rendition.display(cfi);
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
