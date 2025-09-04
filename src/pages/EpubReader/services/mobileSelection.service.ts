import { TouchState, SelectInfo } from '@/types/epub';
import { SetupRenditionEventsProps } from './renditionEvent.service';
import { Contents } from 'epubjs';
import { applyMobileStyles } from '../utils/style.util';
import { TOUCH_TIMING } from '@/constants/epub';
import { logger } from '@/utils/logger';
import { handleSelectionEnd } from './selection.service';

/**
 * Sets up mobile text selection for the given contents.
 * @param props The setup properties for mobile selection.
 * @returns A cleanup function to remove event listeners.
 */
export const setupMobileTextSelection = (props: SetupRenditionEventsProps, contents: Contents) => {
  const touchState: TouchState = {
    isLongPress: false,
    startTime: 0,
    startPos: { x: 0, y: 0 },
    timer: null,
  };

  const { document, window } = contents;
  applyMobileStyles(document);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];

    // Clear any existing timer
    if (touchState.timer) {
      clearTimeout(touchState.timer);
    }

    // Initialize touch state
    touchState.isLongPress = false;
    touchState.startTime = Date.now();
    touchState.startPos = { x: touch.clientX, y: touch.clientY };

    // Set up long press timer
    touchState.timer = setTimeout(() => {
      touchState.isLongPress = true;
      startSelection(touch, document, window);
    }, TOUCH_TIMING.LONG_PRESS_DURATION);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];

    if (touchState.isLongPress) {
      extendSelection(touch, document, window);
      e.preventDefault();
    }
  };

  const handleTouchEnd = (_e: TouchEvent) => {
    const duration = Date.now() - touchState.startTime;

    // Clear timer if it exists
    if (touchState.timer) {
      clearTimeout(touchState.timer);
      touchState.timer = null;
    }

    // Handle selection completion
    if (touchState.isLongPress) {
      completeSelection(document, props.onSelectionCompleted);
    } else if (duration < TOUCH_TIMING.REGULAR_TAP_THRESHOLD) {
      // Regular tap - could trigger click handler if needed
    }

    // Reset state
    touchState.isLongPress = false;
  };

  // Add event listeners
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });

  // Return cleanup function
  return () => {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    if (touchState.timer) {
      clearTimeout(touchState.timer);
    }
  };
};

/**
 * Starts selection at the given touch point.
 */
const startSelection = (touch: Touch, document: Document, window: Window) => {
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
 * Extends selection during touch movement.
 */
const extendSelection = (touch: Touch, document: Document, window: Window) => {
  const selection = window.getSelection();

  if (selection && selection.rangeCount > 0) {
    try {
      const range = selection.getRangeAt(0);
      const newRange = createCaretRange(document, window, touch.clientX, touch.clientY);

      if (newRange) {
        const extendedRange = document.createRange();
        extendedRange.setStart(range.startContainer, range.startOffset);
        extendedRange.setEnd(newRange.startContainer, newRange.startOffset);

        selection.removeAllRanges();
        selection.addRange(extendedRange);
      }
    } catch (error) {
      logger.error('Selection extension failed:', error);
    }
  }
};

/**
 * Completes the selection process.
 */
const completeSelection = (
  document: Document,
  onSelectionCompleted: (selectInfo: SelectInfo) => void
) => {
  setTimeout(() => {
    handleSelectionEnd(document, onSelectionCompleted);
  }, TOUCH_TIMING.SELECTION_DELAY);
};

/**
 * Creates a caret range from touch coordinates.
 */
const createCaretRange = (
  document: Document,
  window: Window,
  clientX: number,
  clientY: number
): Range | null => {
  try {
    // Use type assertion to access the non-standard method
    const caretPosition = (
      document as {
        caretPositionFromPoint?(
          x: number,
          y: number
        ):
          | {
              offsetNode: Node;
              offset: number;
            }
          | undefined;
      }
    ).caretPositionFromPoint?.(clientX - window.scrollX, clientY - window.scrollY);

    if (!caretPosition) return null;

    const range = document.createRange();
    range.setStart(caretPosition.offsetNode, caretPosition.offset);
    range.setEnd(caretPosition.offsetNode, caretPosition.offset);
    return range;
  } catch {
    return null;
  }
};
