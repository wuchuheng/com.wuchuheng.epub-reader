import { useCallback, useEffect, useRef, useState } from 'react';
import { Book, Rendition } from 'epubjs';
import { logger } from '../../../utils/logger';
import { SelectInfo, TocItem } from '../../../types/epub';
import { useParams } from 'react-router-dom';
import { createStorageManager, setupRenditionEvents } from './epub.utils';
import { debounce } from '@wuchuheng/helper';
import { RENDERING_CONFIG } from '../../../constants/epub';
import { useKeyboardNavigation } from './useKeyboardNavigator';

// Types
export type RenditionLocation = {
  start: {
    index: number;
    href: string;
    cfi: string;
    location: number;
    percentage: number;
    displayed: { page: number; total: number };
  };
  end: {
    index: number;
    href: string;
    cfi: string;
    location: number;
    percentage: number;
    displayed: { page: number; total: number };
  };
  atStart: boolean;
  atEnd: boolean;
};

type UseReaderReturn = {
  containerRef: React.RefObject<HTMLDivElement>;
  tableOfContents: TocItem[];
  totalPages: number;
  currentPage: number;
  currentChapterHref: string;
  goToNext: () => void;
  goToPrev: () => void;
  goToSelectChapter: (href: string) => void;
};

type UseReaderProps = {
  book: Book;
  onClick?: () => void;
  onSelect: (selectedInfo: SelectInfo) => void;
};

export type TouchState = {
  isLongPress: boolean;
  startTime: number;
  startPos: { x: number; y: number };
  timer: NodeJS.Timeout | null;
};

export const latestReadingLocation = createStorageManager('latestReadingLocation_');

/**
 * Creates the configuration for the EPUB.js rendition.
 * @returns The rendition configuration object.
 */
const createRenditionConfig = () => ({
  width: RENDERING_CONFIG.WIDTH,
  height: RENDERING_CONFIG.HEIGHT,
  spread: RENDERING_CONFIG.SPREAD,
  minSpreadWidth: RENDERING_CONFIG.MIN_SPREAD_WIDTH,
  manager: RENDERING_CONFIG.MANAGER,
  flow: RENDERING_CONFIG.FLOW,
  allowScriptedContent: true,
});

const createNavigationFunctions = (
  rendition: Rendition,
  currentLocation: React.MutableRefObject<RenditionLocation | null>
) => ({
  goToNext: () => {
    if (currentLocation.current?.atEnd) {
      logger.warn('Reached the end of the book');
      return;
    }
    rendition.next();
  },

  goToPrev: () => {
    if (currentLocation.current?.atStart) {
      logger.log('Reached the start of the book');
      return;
    }
    rendition.prev();
  },

  goToSelectChapter: (href: string) => rendition.display(href),
});

/**
 * Custom hook for the EPUB reader.
 * @param props The props for the reader.
 * @returns The reader state and actions.
 */
export const useReader = (props: UseReaderProps): UseReaderReturn => {
  const { bookId } = useParams<{ bookId: string }>();

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const currentLocationRef = useRef<RenditionLocation | null>(null);

  // State
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([]);
  const [currentChapterHref, setCurrentChapterHref] = useState<string>('');

  // Navigation functions
  const [navigation, setNavigation] = useState({
    goToNext: () => {},
    goToPrev: () => {},
    goToSelectChapter: (_: string) => {},
  });

  const onSelectionCompleted = useCallback(
    debounce<SelectInfo>((selectedInfo: SelectInfo) => {
      if (selectedInfo) {
        logger.log(`Omit event:`, selectedInfo);
        props.onSelect(selectedInfo);
      }
    }, 200),
    []
  );

  // Main book rendering function
  const renderBook = async () => {
    if (!containerRef.current) return;

    // Create rendition
    const rendition = props.book.renderTo(containerRef.current, createRenditionConfig());
    renditionRef.current = rendition;

    // Setup events
    setupRenditionEvents({
      rendition,
      book: props.book,
      bookId: bookId!,
      onSelectionCompleted,
      onClick: props.onClick,
      setter: {
        setCurrentPage,
        setCurrentChapterHref,
        setCurrentLocation: (location) => (currentLocationRef.current = location),
      },
    });

    // Display book
    const latestCfi = latestReadingLocation.get(bookId!);
    rendition.display(latestCfi || undefined);

    // Wait for book to be ready
    await props.book.ready;

    // Generate locations
    await props.book.locations.generate(RENDERING_CONFIG.LOCATION_CHAR_COUNT);
    setTotalPages(props.book.locations.length());

    // Set table of contents
    setTableOfContents(props.book.navigation.toc);

    // Create navigation functions
    const nav = createNavigationFunctions(rendition, currentLocationRef);
    setNavigation(nav);
  };

  // Setup keyboard navigation
  useKeyboardNavigation(navigation.goToNext, navigation.goToPrev);

  // Effects
  useEffect(() => {
    if (containerRef.current && props.book) {
      renderBook();
    }
  }, [props.book]);

  return {
    containerRef,
    tableOfContents,
    totalPages,
    currentPage,
    currentChapterHref,
    goToNext: navigation.goToNext,
    goToPrev: navigation.goToPrev,
    goToSelectChapter: navigation.goToSelectChapter,
  };
};
