import { useEffect, useRef, useState } from 'react';
import { Book, Contents, Rendition } from 'epubjs';
import { logger } from '../../../utils/logger';
import { TocItem } from '../../../types/epub';
import Section from 'epubjs/types/section';
import { useParams } from 'react-router-dom';

// Types
type RenditionLocation = {
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
  onContentClick?: () => void;
  onSelect: (words: string, context: string) => void;
};

type TouchState = {
  isLongPress: boolean;
  startTime: number;
  startPos: { x: number; y: number };
  timer: number | null;
};

// =============================================================================
// STORAGE UTILITIES
// =============================================================================

const createStorageManager = (prefix: string) => ({
  get: (key: string): string | null => localStorage.getItem(`${prefix}${key}`),
  set: (key: string, value: string): void => localStorage.setItem(`${prefix}${key}`, value),
});

const latestReadingLocation = createStorageManager('latestReadingLocation_');

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

const createSelectionHandler =
  (book: Book, onSelect: (words: string, context: string) => void) => async (cfiRange: string) => {
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

      logger.log(`Selected: "${selectedText}"`);
      logger.log(`Context: "${context}"`);

      onSelect(selectedText, context);
    } catch (error) {
      logger.error('Error in selection handler:', error);
    }
  };

// =============================================================================
// MOBILE TOUCH SELECTION
// =============================================================================

const applyMobileStyles = (document: Document) => {
  const body = document.body;
  if (!body) return;

  // Enable text selection
  Object.assign(body.style, {
    webkitUserSelect: 'text',
    userSelect: 'text',
    webkitTouchCallout: 'default',
    touchAction: 'manipulation',
    webkitTapHighlightColor: 'transparent',
  });

  // Add selection styles
  const style = document.createElement('style');
  style.textContent = `
    ::selection {
      background-color: rgba(0, 123, 255, 0.3) !important;
      color: inherit !important;
    }
    ::-webkit-selection, ::-moz-selection {
      background-color: rgba(0, 123, 255, 0.3) !important;
      color: inherit !important;
    }
    
    *, p, div, span, h1, h2, h3, h4, h5, h6 {
      -webkit-user-select: text !important;
      user-select: text !important;
      -webkit-touch-callout: default !important;
    }
  `;
  document.head.appendChild(style);
};

const createCaretRange = (
  document: Document,
  window: Window,
  clientX: number,
  clientY: number
): Range | null => {
  try {
    return (
      document.caretRangeFromPoint?.(clientX - window.scrollX, clientY - window.scrollY) || null
    );
  } catch {
    return null;
  }
};

const createTouchHandlers = (
  document: Document,
  window: Window,
  contents: Contents,
  onSelect: (cfi: string) => void,
  onContentClick: (() => void) | undefined,
  touchState: React.MutableRefObject<TouchState>
) => {
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];

    // Clear existing timer
    if (touchState.current.timer) {
      clearTimeout(touchState.current.timer);
    }

    // Initialize touch state
    touchState.current = {
      isLongPress: false,
      startTime: Date.now(),
      startPos: { x: touch.clientX, y: touch.clientY },
      timer: setTimeout(() => {
        touchState.current.isLongPress = true;

        // Start selection at touch point
        const target = document.elementFromPoint(
          touch.clientX - window.scrollX,
          touch.clientY - window.scrollY
        );

        if (target?.closest('p, div, span, h1, h2, h3, h4, h5, h6')) {
          const range = createCaretRange(document, window, touch.clientX, touch.clientY);
          if (range) {
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }
      }, 500), // 500ms long press
    };
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchState.current.isLongPress || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      try {
        const range = selection!.getRangeAt(0);
        const newRange = createCaretRange(document, window, touch.clientX, touch.clientY);

        if (newRange) {
          const extendedRange = document.createRange();
          extendedRange.setStart(range.startContainer, range.startOffset);
          extendedRange.setEnd(newRange.startContainer, newRange.startOffset);

          selection!.removeAllRanges();
          selection!.addRange(extendedRange);
        }
      } catch {
        // Selection extension failed, continue with existing selection
      }

      e.preventDefault(); // Prevent scrolling during selection
    }
  };

  const handleTouchEnd = (_e: TouchEvent) => {
    const { timer, isLongPress, startTime } = touchState.current;

    if (timer) {
      clearTimeout(timer);
      touchState.current.timer = null;
    }

    const duration = Date.now() - startTime;

    if (isLongPress) {
      // Handle long press selection
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const selectedText = selection!.toString().trim();
          if (selectedText) {
            try {
              const cfi = contents.cfiFromRange(selection!.getRangeAt(0));
              onSelect(cfi);
            } catch (error) {
              logger.error('Error converting range to CFI:', error);
            }
          }
        }
        touchState.current.isLongPress = false;
      }, 50);
    } else if (duration < 300) {
      // Handle regular tap
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection?.toString().trim()) {
          onContentClick?.();
        }
      }, 10);
    }
  };

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
};

const setupMobileTextSelection = (
  contents: Contents,
  onSelect: (cfi: string) => void,
  onContentClick: (() => void) | undefined,
  touchState: React.MutableRefObject<TouchState>
) => {
  const { document, window } = contents;

  applyMobileStyles(document);

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = createTouchHandlers(
    document,
    window,
    contents,
    onSelect,
    onContentClick,
    touchState
  );

  // Add event listeners
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });

  return () => {
    if (touchState.current.timer) {
      clearTimeout(touchState.current.timer);
    }
  };
};

// =============================================================================
// RENDITION MANAGEMENT
// =============================================================================

const createRenditionConfig = () => ({
  width: '100%',
  height: '100%',
  spread: 'always' as const,
  minSpreadWidth: 800,
  manager: 'continuous' as const,
  flow: 'paginated' as const,
  allowScriptedContent: true,
});

const setupRenditionEvents = (
  rendition: Rendition,
  book: Book,
  bookId: string,
  onSelectionHandler: (cfi: string) => void,
  onContentClick: (() => void) | undefined,
  touchState: React.MutableRefObject<TouchState>,
  setters: {
    setCurrentPage: (page: number) => void;
    setCurrentChapterHref: (href: string) => void;
    setCurrentLocation: (location: RenditionLocation) => void;
  }
) => {
  // Location tracking
  rendition.on('relocated', (location: RenditionLocation) => {
    setters.setCurrentLocation(location);

    const percentage = book.locations.percentageFromCfi(location.start.cfi);
    const total = book.locations.length();
    const page = percentage >= 1 ? total : Math.floor(percentage * total) + 1;

    setters.setCurrentPage(page);
    latestReadingLocation.set(bookId, location.start.cfi);
  });

  // Chapter tracking
  rendition.on('rendered', (section: Section) => {
    const current = book.navigation.get(section.href);
    if (current) {
      setters.setCurrentChapterHref(current.href);
    }
  });

  // Selection handling
  rendition.on('selected', (cfiRange: string) => {
    logger.log('EPUB.js selection event triggered');
    onSelectionHandler(cfiRange);
  });

  // Click handling with selection awareness
  rendition.on('click', () => {
    if (touchState.current.isLongPress) return;
  });

  // Mobile text selection setup
  rendition.hooks.content.register((contents: Contents) => {
    setupMobileTextSelection(contents, onSelectionHandler, onContentClick, touchState);
  });
};

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

// =============================================================================
// KEYBOARD NAVIGATION
// =============================================================================

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

// =============================================================================
// MAIN HOOK
// =============================================================================

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

  // Navigation functions
  const [navigation, setNavigation] = useState({
    goToNext: () => {},
    goToPrev: () => {},
    goToSelectChapter: (_href: string) => {},
  });

  // Selection handler
  const selectionHandler = createSelectionHandler(props.book, props.onSelect);

  // Main book rendering function
  const renderBook = async () => {
    if (!containerRef.current) return;

    logger.log('Rendering book');

    // Create rendition
    const rendition = props.book.renderTo(containerRef.current, createRenditionConfig());
    renditionRef.current = rendition;

    // Setup events
    setupRenditionEvents(
      rendition,
      props.book,
      bookId!,
      selectionHandler,
      props.onContentClick,
      touchStateRef,
      {
        setCurrentPage,
        setCurrentChapterHref,
        setCurrentLocation: (location) => {
          currentLocationRef.current = location;
        },
      }
    );

    // Display book
    const latestCfi = latestReadingLocation.get(bookId!);
    rendition.display(latestCfi || undefined);

    // Wait for book to be ready
    await props.book.ready;

    // Generate locations
    await props.book.locations.generate(1600);
    setTotalPages(props.book.locations.length());

    // Set table of contents
    setTableOfContents(props.book.navigation.toc);

    // Create navigation functions
    const nav = createNavigationFunctions(rendition, currentLocationRef);
    setNavigation(nav);

    logger.log('Book is ready');
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
