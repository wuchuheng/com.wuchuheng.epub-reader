import { useEffect, useRef, useState } from 'react';
import { Book, Contents, Rendition } from 'epubjs';
import { logger } from '../../../utils/logger';
import { TocItem } from '../../../types/epub';
import Section from 'epubjs/types/section';
import { useParams } from 'react-router-dom';

// Latest reading location
const latestReadingLocation = {
  prefix: 'latestReadingLocation_',
  getCfi: (key: string): string | null =>
    localStorage.getItem(`${latestReadingLocation.prefix}${key}`),
  setCfi: (key: string, cfi: string): void => {
    localStorage.setItem(`${latestReadingLocation.prefix}${key}`, cfi);
  },
};

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

export const useReader = (props: UseReaderProps): UseReaderReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const goToNextRef = useRef<() => void>(() => {});
  const goToPrevRef = useRef<() => void>(() => {});
  const goToSelectChapterRef = useRef<(href: string) => void>(() => {});
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([]);
  const currentRenditionLocationRef = useRef<RenditionLocation | null>(null);
  const [currentChapterHref, setCurrentChapterHref] = useState<string>('');

  // Touch selection tracking
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef<boolean>(false);

  const onselect = async (cfiRange: string, book: Book) => {
    try {
      // 1. Input handling
      const range = await book.getRange(cfiRange);
      if (!range) {
        logger.warn('Could not get range from CFI');
        return;
      }

      // Find containing paragraph: Start from common ancestor
      const node = range.commonAncestorContainer;
      if (!node) {
        logger.warn('No text node found');
        return;
      }

      // Get better context by finding the paragraph element
      let context = '';
      let currentNode: Node | null = node;

      // Look for paragraph-like container
      while (currentNode && currentNode.nodeType !== Node.DOCUMENT_NODE) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          const element = currentNode as HTMLElement;
          const tagName = element.tagName.toLowerCase();

          // Check if this is a paragraph-like element
          if (
            ['p', 'div', 'section', 'article', 'li'].includes(tagName) ||
            element.classList.contains('paragraph')
          ) {
            context = element.textContent?.trim() || '';
            break;
          }
        }
        currentNode = currentNode.parentNode;
      }

      // Fallback to original method
      if (!context) {
        context = node.textContent?.trim() || '';
      }

      const selectedText = range.toString().trim();

      logger.log(`Selected text: "${selectedText}"`);
      logger.log(`Context: "${context}"`);
      logger.log(`CFI Range: ${cfiRange}`);

      if (selectedText) {
        props.onSelect(selectedText, context);
      }
    } catch (error) {
      logger.error('Error in onselect:', error);
    }
  };

  // Setup mobile-friendly text selection
  const setupMobileTextSelection = (contents: Contents) => {
    const document = contents.document;
    const window = contents.window;
    const body = document.body;

    if (!body) return;

    // Enable text selection CSS properties
    body.style.webkitUserSelect = 'text';
    body.style.userSelect = 'text';
    body.style.webkitTouchCallout = 'default';
    body.style.touchAction = 'manipulation';

    // Prevent default touch behaviors that interfere with selection
    body.style.webkitTapHighlightColor = 'transparent';

    // Add selection styling
    const style = document.createElement('style');
    style.textContent = `
      ::selection {
        background-color: rgba(0, 123, 255, 0.3) !important;
        color: inherit !important;
      }
      ::-webkit-selection {
        background-color: rgba(0, 123, 255, 0.3) !important;
        color: inherit !important;
      }
      ::-moz-selection {
        background-color: rgba(0, 123, 255, 0.3) !important;
        color: inherit !important;
      }
      
      /* Improve text selection on mobile */
      * {
        -webkit-user-select: text !important;
        user-select: text !important;
      }
      
      /* Make sure text is selectable */
      p, div, span, h1, h2, h3, h4, h5, h6 {
        -webkit-user-select: text !important;
        user-select: text !important;
        -webkit-touch-callout: default !important;
      }
    `;
    document.head.appendChild(style);

    // Handle long press for text selection initiation
    let touchStartTime = 0;
    let touchStartPos = { x: 0, y: 0 };
    let longPressTimer: NodeJS.Timeout | null = null;

    // Touch start handler
    const handleTouchStart = (e: TouchEvent) => {
      touchStartTime = Date.now();
      const touch = e.touches[0];
      touchStartPos = { x: touch.clientX, y: touch.clientY };
      isLongPressRef.current = false;

      // Clear any existing timer
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }

      // Set up long press detection
      longPressTimer = setTimeout(() => {
        isLongPressRef.current = true;

        // Try to start text selection at the touch point
        const target = document.elementFromPoint(
          touch.clientX - window.scrollX,
          touch.clientY - window.scrollY
        );

        if (target && target.closest('p, div, span, h1, h2, h3, h4, h5, h6')) {
          // Create a selection at the touch point
          try {
            const range = document.caretRangeFromPoint?.(
              touch.clientX - window.scrollX,
              touch.clientY - window.scrollY
            );

            if (range) {
              const selection = window.getSelection();
              if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
          } catch (error) {
            logger.log('Could not create caret range');
          }
        }
      }, 500); // 500ms for long press
    };

    // Touch move handler for extending selection
    const handleTouchMove = (e: TouchEvent) => {
      if (isLongPressRef.current && e.touches.length === 1) {
        const touch = e.touches[0];
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
          try {
            const range = selection.getRangeAt(0);
            const startContainer = range.startContainer;
            const startOffset = range.startOffset;

            // Find the element at the current touch position
            const currentElement = document.elementFromPoint(
              touch.clientX - window.scrollX,
              touch.clientY - window.scrollY
            );

            if (currentElement) {
              // Try to extend the selection
              const newRange = document.caretRangeFromPoint?.(
                touch.clientX - window.scrollX,
                touch.clientY - window.scrollY
              );

              if (newRange) {
                const extendedRange = document.createRange();
                extendedRange.setStart(startContainer, startOffset);
                extendedRange.setEnd(newRange.startContainer, newRange.startOffset);

                selection.removeAllRanges();
                selection.addRange(extendedRange);
              }
            }
          } catch (error) {
            // Selection extension failed, continue with existing selection
          }
        }

        // Prevent scrolling during selection
        e.preventDefault();
      }
    };

    // Touch end handler
    const handleTouchEnd = (e: TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;

      // If it was a long press with selection
      if (isLongPressRef.current) {
        setTimeout(() => {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString().trim();

            if (selectedText) {
              try {
                const cfi = contents.cfiFromRange(range);
                onselect(cfi, props.book);
              } catch (error) {
                logger.error('Error converting range to CFI:', error);
              }
            }
          }
          isLongPressRef.current = false;
        }, 50);
      }
      // Handle regular tap
      else if (touchDuration < 300) {
        // This was a regular tap, not a long press
        if (!isLongPressRef.current) {
          // Only trigger click if no selection is active
          setTimeout(() => {
            const selection = window.getSelection();
            if (!selection || selection.toString().trim() === '') {
              props.onContentClick?.();
            }
          }, 10);
        }
      }
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Also handle selection change events
    document.addEventListener('selectionchange', () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }

      selectionTimeoutRef.current = setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const selectedText = range.toString().trim();

          // Only process if we have meaningful selected text
          if (selectedText && selectedText.length > 0) {
            try {
              const cfi = contents.cfiFromRange(range);
              // Don't call onselect here to avoid double-processing
              // onselect(cfi, props.book);
            } catch (error) {
              // CFI creation failed
            }
          }
        }
      }, 100);
    });

    // Clean up function would go here if needed
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  };

  // Access the bookId from the route /reader/:bookId via react-router hooks.
  const { bookId } = useParams<{ bookId: string }>();

  const onRenderBook = async () => {
    logger.log('Rendering book:', props.book);

    // Render book
    const rendition = props.book.renderTo(containerRef.current!, {
      width: '100%',
      height: '100%',
      spread: 'always',
      minSpreadWidth: 800,
      manager: 'continuous',
      flow: 'paginated',
      allowScriptedContent: true,
    });

    renditionRef.current = rendition;

    // Setup mobile text selection for each content section
    rendition.hooks.content.register((contents: Contents) => {
      setupMobileTextSelection(contents);
    });

    // Listen to events
    rendition.on('relocated', (location: RenditionLocation) => {
      currentRenditionLocationRef.current = location;

      // Update current page based on location
      const percentage = props.book.locations.percentageFromCfi(location.start.cfi);
      const total = props.book.locations.length();
      let page = Math.floor(percentage * total) + 1;
      if (percentage >= 1) {
        page = total;
      }

      setCurrentPage(page);
      latestReadingLocation.setCfi(bookId!, location.start.cfi);
    });

    rendition.on('rendered', (section: Section) => {
      const current = props.book.navigation.get(section.href);
      if (current) {
        setCurrentChapterHref(current.href);
      }
    });

    // Enhanced selection handler
    rendition.on('selected', (cfiRange: string, contents: Contents) => {
      logger.log('EPUB.js selection event triggered');
      onselect(cfiRange, props.book);
    });

    // Modified click handler to work better with mobile selection
    let clickTimeout: NodeJS.Timeout;
    rendition.on('click', (event: any) => {
      // Don't trigger click if we just finished a selection
      if (isLongPressRef.current) {
        return;
      }

      clickTimeout = setTimeout(() => {
        // Check if there's any active selection
        const contents = renditionRef.current?.getContents();
        let hasSelection = false;

        if (contents) {
          for (const content of contents) {
            const selection = content.window.getSelection();
            if (selection && selection.toString().trim()) {
              hasSelection = true;
              break;
            }
          }
        }

        if (!hasSelection) {
          props.onContentClick?.();
        }
      }, 50);
    });

    // Clear click timeout on selection
    rendition.on('selected', () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    });

    const latestCfi = latestReadingLocation.getCfi(bookId!);
    rendition.display(latestCfi || undefined);

    // Setup book navigation
    await props.book.ready;

    const chars = 1600;
    await props.book.locations.generate(chars);

    const totalPages = props.book.locations.length();
    setTotalPages(totalPages);

    logger.log('Book is ready');

    // Navigation functions
    goToNextRef.current = () => {
      if (currentRenditionLocationRef.current?.atEnd) {
        logger.warn('Reached the end of the book');
        return;
      }
      rendition.next();
    };

    goToPrevRef.current = () => {
      if (currentRenditionLocationRef.current?.atStart) {
        logger.log('Reached the start of the book');
        return;
      }
      rendition.prev();
    };

    // Extract and set table of contents
    const toc = props.book.navigation.toc;
    setTableOfContents(toc);

    // Chapter navigation
    goToSelectChapterRef.current = (href: string) => rendition.display(href);
  };

  // Keyboard navigation
  useEffect(() => {
    const keyListener = (e: KeyboardEvent) => {
      // Don't navigate if user is selecting text
      const activeSelection = window.getSelection();
      if (activeSelection && activeSelection.toString().trim()) {
        return;
      }

      if (e.key === 'ArrowLeft') goToPrevRef.current?.();
      if (e.key === 'ArrowRight') goToNextRef.current?.();
    };

    document.addEventListener('keydown', keyListener);
    return () => document.removeEventListener('keydown', keyListener);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      logger.log('Container ref is set');
      onRenderBook();
    }
  }, [props.book, containerRef]);

  // Cleanup
  useEffect(() => {
    console.log('Cleanup effect');
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    tableOfContents,
    totalPages,
    currentPage,
    currentChapterHref,
    goToNext: goToNextRef.current,
    goToPrev: goToPrevRef.current,
    goToSelectChapter: goToSelectChapterRef.current,
  };
};
