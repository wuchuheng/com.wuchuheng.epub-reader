import { useCallback, useEffect, useRef, useState } from 'react';
import { Book, Rendition } from 'epubjs';
import { logger } from '../../../utils/logger';
import { SelectInfo, TocItem } from '../../../types/epub';
import { useParams } from 'react-router-dom';
import { createStorageManager, setupRenditionEvents } from './epub.utils';
import { debounce } from '@wuchuheng/helper';
import { RENDERING_CONFIG } from '../../../constants/epub';

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
  timer: number | null;
};

export const latestReadingLocation = createStorageManager('latestReadingLocation_');

// =============================================================================
// TEXT SELECTION UTILITIES
// =============================================================================

const findParagraphElement = (node: Node): HTMLElement | null => {
  const paragraphTags = ['p', 'div', 'section', 'article', 'li'];
  let current: Node | null = node;

  while (current && current.nodeType !== Node.DOCUMENT_NODE) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const element = current as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      if (paragraphTags.includes(tagName) || element.classList.contains('paragraph')) {
        return element;
      }
    }
    current = current.parentNode;
  }

  return null;
};

const extractTextContext = (node: Node): string => {
  const paragraph = findParagraphElement(node);
  if (paragraph) {
    return paragraph.textContent?.trim() || '';
  }
  return node.textContent?.trim() || '';
};

type SelectionHandlerProps = {
  book: Book;
  cfiRange: string;
};

/**
 * Extracts the selected text information from the EPUB book.
 * @param param0 The selection handler parameters.
 * @returns The extracted selection information.
 */
const extractSelectedInfo = async ({
  book,
  cfiRange,
}: SelectionHandlerProps): Promise<SelectInfo | undefined> => {
  try {
    const range = await book.getRange(cfiRange);
    if (!range) {
      logger.warn('Could not get range from CFI');
      return;
    }

    const selectedText = range.toString().trim();
    if (!selectedText) {
      logger.warn('No text selected');
      return;
    }

    const context = extractTextContext(range.commonAncestorContainer);

    const result = { words: selectedText, context };
    return result;
  } catch (error) {
    logger.error('Error in selection handler:', error);
  }
};

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
 * Implements keyboard navigation for the EPUB reader.
 * @param goToNext
 * @param goToPrev
 */
const useKeyboardNavigation = (goToNext: () => void, goToPrev: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if user is selecting text
      if (window.getSelection()?.toString().trim()) return;

      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);
};

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
  const touchStateRef = useRef<TouchState>({
    isLongPress: false,
    startTime: 0,
    startPos: { x: 0, y: 0 },
    timer: null,
  });

  // State
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([]);
  const [currentChapterHref, setCurrentChapterHref] = useState<string>('');
  const selectedInfoRef = useRef<SelectInfo | undefined>(undefined);

  // Navigation functions
  const [navigation, setNavigation] = useState({
    goToNext: () => {},
    goToPrev: () => {},
    goToSelectChapter: (_href: string) => {},
  });

  const onSelectionCompleted = useCallback(
    debounce<void>(() => {
      if (selectedInfoRef.current) {
        logger.log(`Omit event:`, selectedInfoRef.current);
        props.onSelect(selectedInfoRef.current);
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

    const onSelectedInfo = (info: SelectInfo | undefined) => {
      if (info) selectedInfoRef.current = info;
    };

    // Setup events
    setupRenditionEvents({
      rendition,
      book: props.book,
      bookId: bookId!,
      onSelectionCompleted,
      onSelected: async (cfiRange) => {
        const info = await extractSelectedInfo({
          book: props.book,
          cfiRange,
        });
        onSelectedInfo(info);
      },
      onClick: props.onClick,
      onClickContent: (selected) => onSelectedInfo(selected),
      touchState: touchStateRef,
      setters: {
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

  // Cleanup
  useEffect(() => {
    logger.log('Cleaning up timers');
    return () => {
      if (touchStateRef.current.timer) {
        clearTimeout(touchStateRef.current.timer);
      }
    };
  }, []);

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
