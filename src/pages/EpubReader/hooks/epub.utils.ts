import { Book, Contents, Rendition } from 'epubjs';
import { latestReadingLocation, RenditionLocation, TouchState } from './useEpubReader';
import Section from 'epubjs/types/section';
import { logger } from '../../../utils/logger';
import { SelectInfo } from '../../../types/epub';
import { TOUCH_TIMING, SELECTION_COLORS, WORD_BOUNDARY_REGEX } from '../../../constants/epub';

type SetupRenditionEventsProps = {
  rendition: Rendition;
  book: Book;
  bookId: string;
  touchState: React.MutableRefObject<TouchState>;
  onSelected: (cfi: string) => Promise<void>;
  onClick: (() => void) | undefined;
  onClickContent: (selected: SelectInfo) => void;
  onSelectionCompleted: () => void;
  setters: {
    setCurrentPage: (page: number) => void;
    setCurrentChapterHref: (href: string) => void;
    setCurrentLocation: (location: RenditionLocation) => void;
  };
};

/**
 * Sets up event listeners for the EPUB.js rendition.
 * @param rendition The EPUB.js rendition instance.
 * @param book The EPUB.js book instance.
 * @param bookId The ID of the book.
 * @param onSelectionHandler The callback to call when text is selected.
 * @param onContentClick The callback to call when the content is clicked.
 * @param touchState The mutable ref object to track touch state.
 * @param setters
 */
export const setupRenditionEvents = (props: SetupRenditionEventsProps) => {
  // Location tracking
  props.rendition.on('relocated', (location: RenditionLocation) => {
    props.setters.setCurrentLocation(location);

    const percentage = props.book.locations.percentageFromCfi(location.start.cfi);
    const total = props.book.locations.length();
    const page = percentage >= 1 ? total : Math.floor(percentage * total) + 1;

    props.setters.setCurrentPage(page);
    latestReadingLocation.set(props.bookId, location.start.cfi);
  });

  // Chapter tracking
  props.rendition.on('rendered', (section: Section) => {
    const current = props.book.navigation.get(section.href);
    if (current) {
      props.setters.setCurrentChapterHref(current.href);
    }
  });
  props.rendition.on('touchend', () => {
    logger.log('Touch end event detected');
    props.onSelectionCompleted();
  });

  // Selection handling
  props.rendition.on('selected', (cfiRange: string) => {
    props.onSelected(cfiRange);
  });

  props.rendition.hooks.content.register((contents: Contents, _rendition: Rendition) => {
    contents.document.addEventListener('mouseup', (_event: MouseEvent) => {
      logger.log(`Mouse up event detected`);
      props.onSelectionCompleted();
    });
  });

  // Click handling with selection awareness
  props.rendition.on('click', (pointer: PointerEvent, contents: Contents) => {
    // 2. Extract the word under the pointer and print it here <-- TODO: How to implement this feature.
    const selectedInfo = getWordAtPointer(pointer, contents);

    if (selectedInfo) {
      props.onClickContent(selectedInfo);
    }

    if (props.touchState.current.isLongPress) return;
  });

  // Mobile text selection setup
  props.rendition.hooks.content.register((contents: Contents) => {
    setupMobileTextSelection(contents, props.onSelected, props.touchState);
  });
};

/**
 * Creates a storage manager for managing local storage with a specific prefix.
 * @param prefix The prefix to use for all storage keys.
 * @returns An object with `get` and `set` methods for interacting with local storage.
 */
export const createStorageManager = (prefix: string) => ({
  get: (key: string): string | null => localStorage.getItem(`${prefix}${key}`),
  set: (key: string, value: string): void => localStorage.setItem(`${prefix}${key}`, value),
});

/**
 * Sets up mobile text selection for the given contents.
 * @param contents The contents to set up selection for.
 * @param onSelect The callback to call when text is selected.
 * @param onContentClick The callback to call when the content is clicked.
 * @param touchState The mutable ref object to track touch state.
 * @returns A cleanup function to remove event listeners.
 */
const setupMobileTextSelection = (
  contents: Contents,
  onSelect: (cfi: string) => void,
  // onContentClick: (() => void) | undefined,
  touchState: React.MutableRefObject<TouchState>
) => {
  const { document, window } = contents;

  applyMobileStyles(document);

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = createTouchHandlers(
    document,
    window,
    contents,
    onSelect,
    // onContentClick,
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

/**
 * Applies mobile styles to the document for better touch and selection handling.
 * @param document The document to apply styles to.
 * @returns A cleanup function to remove the styles.
 */
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
      background-color: ${SELECTION_COLORS.BACKGROUND} !important;
      color: ${SELECTION_COLORS.TEXT_INHERIT} !important;
    }
    ::-webkit-selection, ::-moz-selection {
      background-color: ${SELECTION_COLORS.BACKGROUND} !important;
      color: ${SELECTION_COLORS.TEXT_INHERIT} !important;
    }
    
    *, p, div, span, h1, h2, h3, h4, h5, h6 {
      -webkit-user-select: text !important;
      user-select: text !important;
      -webkit-touch-callout: default !important;
    }
  `;
  document.head.appendChild(style);
};

/**
 * Creates touch event handlers for mobile text selection.
 * @param document The document to attach event listeners to.
 * @param window The window object.
 * @param contents The contents of the EPUB book.
 * @param onSelect The callback to call when text is selected.
 * @param onContentClick The callback to call when the content is clicked.
 * @param touchState The mutable ref object to track touch state.
 * @returns An object containing touch event handlers.
 */
/**
 * Initializes touch state and starts long press timer
 */
const initializeTouchState = (
  touch: Touch,
  document: Document,
  window: Window,
  touchState: React.MutableRefObject<TouchState>
) => {
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
      startSelectionAtTouchPoint(touch, document, window, touchState);
    }, TOUCH_TIMING.LONG_PRESS_DURATION),
  };
};

/**
 * Starts text selection at the given touch point
 */
const startSelectionAtTouchPoint = (
  touch: Touch,
  document: Document,
  window: Window,
  touchState: React.MutableRefObject<TouchState>
) => {
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
};

/**
 * Extends selection during touch movement
 */
const extendSelection = (
  touch: Touch,
  document: Document,
  window: Window,
  touchState: React.MutableRefObject<TouchState>
) => {
  if (!touchState.current.isLongPress) return;

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
  }
};

/**
 * Handles completion of touch interaction
 */
const completeTouchInteraction = (
  touchState: React.MutableRefObject<TouchState>,
  contents: Contents,
  onSelect: (cfi: string) => void
) => {
  const { timer, isLongPress, startTime } = touchState.current;

  if (timer) {
    clearTimeout(timer);
    touchState.current.timer = null;
  }

  const duration = Date.now() - startTime;

  if (isLongPress) {
    handleLongPressCompletion(touchState, contents, onSelect);
  } else if (duration < TOUCH_TIMING.REGULAR_TAP_THRESHOLD) {
    handleRegularTap();
  }
};

/**
 * Handles long press selection completion
 */
const handleLongPressCompletion = (
  touchState: React.MutableRefObject<TouchState>,
  contents: Contents,
  onSelect: (cfi: string) => void
) => {
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
  }, TOUCH_TIMING.SELECTION_DELAY);
};

/**
 * Handles regular tap completion
 */
const handleRegularTap = () => {
  setTimeout(() => {
    const selection = window.getSelection();
    if (!selection?.toString().trim()) {
      // Handle regular tap if needed
      // onContentClick?.();
    }
  }, TOUCH_TIMING.CLICK_DELAY);
};

/**
 * Creates touch event handlers for mobile text selection
 */
const createTouchHandlers = (
  document: Document,
  window: Window,
  contents: Contents,
  onSelect: (cfi: string) => void,
  touchState: React.MutableRefObject<TouchState>
) => {
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    initializeTouchState(touch, document, window, touchState);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    extendSelection(touch, document, window, touchState);
    e.preventDefault(); // Prevent scrolling during selection
  };

  const handleTouchEnd = (_e: TouchEvent) => {
    completeTouchInteraction(touchState, contents, onSelect);
  };

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
};

/**
 * Creates a caret range from touch coordinates.
 * @param document The document to create the range in.
 * @param window The window object.
 * @param clientX The X coordinate of the touch.
 * @param clientY The Y coordinate of the touch.
 * @returns The created range or null if it could not be created.
 */
const createCaretRange = (
  document: Document,
  window: Window,
  clientX: number,
  clientY: number
): Range | null => {
  try {
    const caretPosition = document.caretPositionFromPoint?.(
      clientX - window.scrollX,
      clientY - window.scrollY
    );
    if (!caretPosition) return null;

    const range = document.createRange();
    range.setStart(caretPosition.offsetNode, caretPosition.offset);
    range.setEnd(caretPosition.offsetNode, caretPosition.offset);
    return range;
  } catch {
    return null;
  }
};

/**
 * Gets the word at the pointer position.
 * @param pointer
 * @param contents
 * @returns
 */
const getWordAtPointer = (pointer: PointerEvent, contents: Contents): SelectInfo | null => {
  try {
    const { document, window } = contents;

    // Get the element at the pointer position
    const x = pointer.clientX - window.scrollX;
    const y = pointer.clientY - window.scrollY;

    // Create a range at the pointer position
    const caretPosition = document.caretPositionFromPoint?.(x, y);
    if (!caretPosition) return null;

    const range = document.createRange();
    range.setStart(caretPosition.offsetNode, caretPosition.offset);
    range.setEnd(caretPosition.offsetNode, caretPosition.offset);

    // Get the text node
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return null;

    const text = textNode.textContent || '';
    const offset = range.startOffset;

    // Define word boundary regex
    const wordBoundary = WORD_BOUNDARY_REGEX;

    // Find word start
    let start = offset;
    while (start > 0 && !wordBoundary.test(text[start - 1])) {
      start--;
    }

    // Find word end
    let end = offset;
    while (end < text.length && !wordBoundary.test(text[end])) {
      end++;
    }

    // Extract the word
    let word: string | null = text.slice(start, end).trim();

    // Return null if empty or just whitespace
    word = word.length > 0 ? word : null;
    if (!word) {
      return null;
    }

    const result: SelectInfo = {
      words: word,
      context: text,
    };
    return result;
  } catch (error) {
    logger.error('Error extracting word at pointer:', error);
    return null;
  }
};
