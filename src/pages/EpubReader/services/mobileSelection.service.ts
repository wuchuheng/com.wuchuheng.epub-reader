import { TouchState, SelectInfo } from '@/types/epub';
import { SetupRenditionEventsProps } from './renditionEvent.service';
import { Contents } from 'epubjs';
import { applyMobileStyles } from '../utils/style.util';
import { TOUCH_TIMING } from '@/constants/epub';
import { logger } from '@/utils/logger';

/**
 * Sets up mobile text selection for the given contents.
 * @param props The setup properties for mobile selection.
 * @returns A cleanup function to remove event listeners.
 */
export const setupMobileTextSelection = (props: SetupRenditionEventsProps, contents: Contents) => {
  logger.info('Setting up mobile text selection', { bookId: props.bookId });

  // Add event listeners to the rendition container
  const touchState: TouchState = {
    isLongPress: false,
    startTime: 0,
    startPos: { x: 0, y: 0 },
    timer: null,
  };

  const { document, window } = contents;

  applyMobileStyles(document);

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = createTouchHandlers(
    document,
    window,
    contents,
    (cfi: string) => {
      logger.info('Mobile selection completed', { cfi, bookId: props.bookId });
      // Convert CFI to SelectInfo and call the proper callback
      try {
        const selection = document.getSelection();
        if (selection && selection.rangeCount > 0) {
          const selectedText = selection.toString().trim();
          if (selectedText) {
            const selectInfo: SelectInfo = {
              words: selectedText,
              context: `**${selectedText}**`,
            };
            props.onSelectionCompleted(selectInfo);
            logger.info('Selection callback executed', { selectedText, bookId: props.bookId });
          }
        }
      } catch (error) {
        logger.error('Error in selection callback', { error, bookId: props.bookId });
      }
    },
    touchState
  );

  // Add event listeners
  logger.info('Adding touch event listeners', { bookId: props.bookId });
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });

  // Return cleanup function
  return () => {
    logger.info('Cleaning up mobile selection event listeners', { bookId: props.bookId });
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    if (touchState.timer) {
      clearTimeout(touchState.timer);
      touchState.timer = null;
    }
  };
};

/**
 * Creates touch event handlers for mobile text selection
 */
const createTouchHandlers = (
  document: Document,
  window: Window,
  contents: Contents,
  onSelect: (cfi: string) => void,
  touchState: TouchState
) => {
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    logger.info('Touch start event', {
      x: touch.clientX,
      y: touch.clientY,
      touchStateBefore: { ...touchState },
    });
    initializeTouchState(touch, document, window, touchState);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 1) {
      logger.info('Touch move ignored - multiple touches', { touchCount: e.touches.length });
      return;
    }

    const touch = e.touches[0];
    logger.info('Touch move event', {
      x: touch.clientX,
      y: touch.clientY,
      isLongPress: touchState.isLongPress,
    });
    extendSelection(touch, document, window, touchState);
    e.preventDefault(); // Prevent scrolling during selection
  };

  const handleTouchEnd = (_e: TouchEvent) => {
    logger.info('Touch end event', {
      touchState: { ...touchState },
      duration: Date.now() - touchState.startTime,
    });
    completeTouchInteraction(touchState, contents, onSelect);
  };

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
};

/**
 * Initializes touch state and starts long press timer
 * @param document The document to attach event listeners to.
 * @param window The window object.
 * @param contents The contents of the EPUB book.
 * @param onSelect The callback to call when text is selected.
 * @param onContentClick The callback to call when the content is clicked.
 * @param touchState The mutable ref object to track touch state.
 * @returns An object containing touch event handlers.
 */
const initializeTouchState = (
  touch: Touch,
  document: Document,
  window: Window,
  touchState: TouchState
) => {
  logger.info('Initializing touch state', {
    x: touch.clientX,
    y: touch.clientY,
    hadExistingTimer: !!touchState.timer,
    touchStateBefore: { ...touchState },
  });

  // Clear existing timer
  if (touchState.timer) {
    clearTimeout(touchState.timer);
    logger.info('Cleared existing touch timer');
  }

  // MUTATE the existing object instead of reassigning
  touchState.isLongPress = false;
  touchState.startTime = Date.now();
  touchState.startPos = { x: touch.clientX, y: touch.clientY };
  touchState.timer = setTimeout(() => {
    logger.info('Long press timer triggered', {
      x: touch.clientX,
      y: touch.clientY,
      duration: Date.now() - touchState.startTime,
      touchState: { ...touchState }, // Log the actual state
    });
    startSelectionAtTouchPoint(touch, document, window, touchState);
  }, TOUCH_TIMING.LONG_PRESS_DURATION);

  logger.info('Touch state initialized', {
    touchState: { ...touchState },
    longPressDelay: TOUCH_TIMING.LONG_PRESS_DURATION,
    objectReference: 'same-object-mutated',
  });
};

/**
 * Handles completion of touch interaction
 */
const completeTouchInteraction = (
  touchState: TouchState,
  contents: Contents,
  onSelect: (cfi: string) => void
) => {
  const { timer, isLongPress, startTime } = touchState;

  logger.info('Completing touch interaction', {
    hadTimer: !!timer,
    isLongPress,
    duration: Date.now() - startTime,
    tapThreshold: TOUCH_TIMING.REGULAR_TAP_THRESHOLD,
  });

  if (timer) {
    clearTimeout(timer);
    touchState.timer = null;
    logger.info('Cleared long press timer');
  }

  const duration = Date.now() - startTime;

  if (isLongPress) {
    logger.info('Processing as long press selection', { duration });
    handleLongPressCompletion(touchState, contents, onSelect);
  } else if (duration < TOUCH_TIMING.REGULAR_TAP_THRESHOLD) {
    logger.info('Processing as regular tap', { duration });
    handleRegularTap();
  } else {
    logger.info('Touch interaction ignored - too long for tap, not long press', {
      duration,
      isLongPress,
    });
  }
};

/**
 * Extends selection during touch movement
 */
const extendSelection = (
  touch: Touch,
  document: Document,
  window: Window,
  touchState: TouchState
) => {
  if (!touchState.isLongPress) {
    logger.info('Selection extension ignored - not in long press mode');
    return;
  }

  logger.info('Extending selection', {
    x: touch.clientX,
    y: touch.clientY,
    touchState: { ...touchState },
  });

  const selection = window.getSelection();

  if (selection && selection.rangeCount > 0) {
    try {
      const range = selection!.getRangeAt(0);
      logger.info('Current selection range found', {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
      });

      const newRange = createCaretRange(document, window, touch.clientX, touch.clientY);

      if (newRange) {
        logger.info('New caret range created successfully', {
          newRangeStart: newRange.startContainer,
          newRangeOffset: newRange.startOffset,
        });

        const extendedRange = document.createRange();
        extendedRange.setStart(range.startContainer, range.startOffset);
        extendedRange.setEnd(newRange.startContainer, newRange.startOffset);

        selection!.removeAllRanges();
        selection!.addRange(extendedRange);

        logger.info('Selection extended successfully', {
          selectedText: selection!.toString(),
          extendedRange: {
            startContainer: extendedRange.startContainer,
            startOffset: extendedRange.startOffset,
            endContainer: extendedRange.endContainer,
            endOffset: extendedRange.endOffset,
          },
        });
      } else {
        logger.warn('Failed to create new caret range for selection extension');
      }
    } catch (error) {
      logger.error('Selection extension failed', { error });
      // Selection extension failed, continue with existing selection
    }
  } else {
    logger.info('No existing selection found to extend');
  }
};

/**
 * Starts text selection at the given touch point
 */
const startSelectionAtTouchPoint = (
  touch: Touch,
  document: Document,
  window: Window,
  touchState: TouchState
) => {
  logger.info('Starting selection at touch point', {
    x: touch.clientX,
    y: touch.clientY,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  });

  touchState.isLongPress = true;

  // Start selection at touch point
  const target = document.elementFromPoint(
    touch.clientX - window.scrollX,
    touch.clientY - window.scrollY
  );

  logger.info('Target element found', {
    target: target?.tagName,
    targetClass: target?.className,
    isValidTarget: !!target?.closest('p, div, span, h1, h2, h3, h4, h5, h6'),
  });

  if (target?.closest('p, div, span, h1, h2, h3, h4, h5, h6')) {
    const range = createCaretRange(document, window, touch.clientX, touch.clientY);
    if (range) {
      logger.info('Range created successfully, applying selection');
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      logger.info('Selection applied', {
        selectedText: selection?.toString(),
        range: {
          startContainer: range.startContainer,
          startOffset: range.startOffset,
          endContainer: range.endContainer,
          endOffset: range.endOffset,
        },
      });
    } else {
      logger.warn('Failed to create range from touch point');
    }
  } else {
    logger.info('Touch point not on a selectable element');
  }
};

/**
 * Handles long press selection completion
 */
const handleLongPressCompletion = (
  touchState: TouchState,
  contents: Contents,
  onSelect: (cfi: string) => void
) => {
  logger.info('Handling long press completion', {
    selectionDelay: TOUCH_TIMING.SELECTION_DELAY,
    touchState: { ...touchState },
  });

  setTimeout(() => {
    logger.info('Processing long press selection after delay');
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const selectedText = selection!.toString().trim();
      logger.info('Selection found', {
        selectedText,
        rangeCount: selection.rangeCount,
        selectionLength: selectedText.length,
      });

      if (selectedText) {
        try {
          const range = selection!.getRangeAt(0);
          logger.info('Converting range to CFI', {
            range: {
              startContainer: range.startContainer,
              startOffset: range.startOffset,
              endContainer: range.endContainer,
              endOffset: range.endOffset,
            },
          });

          const cfi = contents.cfiFromRange(selection!.getRangeAt(0));
          logger.info('CFI conversion successful', { cfi });
          onSelect(cfi);
        } catch (error) {
          logger.error('Error converting range to CFI:', { error, selectedText });
        }
      } else {
        logger.info('No selected text found (empty selection)');
      }
    } else {
      logger.info('No selection found after long press');
    }

    logger.info('Resetting long press state');
    touchState.isLongPress = false;
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
 * Custom CaretPosition interface representing the return value of caretPositionFromPoint
 */
interface CustomCaretPosition {
  offsetNode: Node;
  offset: number;
}
/**
 * Extended Document type with caretPositionFromPoint method
 * This method is available in modern browsers but missing from TypeScript's DOM types
 */
type DocumentWithCaretPosition = Document & {
  caretPositionFromPoint?(x: number, y: number): CustomCaretPosition | undefined;
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
  logger.info('Creating caret range from coordinates', {
    clientX,
    clientY,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    adjustedX: clientX - window.scrollX,
    adjustedY: clientY - window.scrollY,
  });

  try {
    const caretPosition = (document as DocumentWithCaretPosition).caretPositionFromPoint?.(
      clientX - window.scrollX,
      clientY - window.scrollY
    );

    if (!caretPosition) {
      logger.warn('No caret position found at coordinates', {
        clientX,
        clientY,
        adjustedX: clientX - window.scrollX,
        adjustedY: clientY - window.scrollY,
      });
      return null;
    }

    logger.info('Caret position found', {
      offsetNode: caretPosition.offsetNode,
      offset: caretPosition.offset,
      nodeType: caretPosition.offsetNode.nodeType,
      nodeContent: caretPosition.offsetNode.textContent?.substring(0, 50),
    });

    const range = document.createRange();
    range.setStart(caretPosition.offsetNode, caretPosition.offset);
    range.setEnd(caretPosition.offsetNode, caretPosition.offset);

    logger.info('Range created successfully', {
      range: {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
        collapsed: range.collapsed,
      },
    });

    return range;
  } catch (error) {
    logger.error('Error creating caret range', {
      error,
      clientX,
      clientY,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    });
    return null;
  }
};
