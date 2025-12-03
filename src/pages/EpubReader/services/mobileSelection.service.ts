import { TouchState, SelectInfo } from '@/types/epub';
import { SetupRenditionEventsProps } from './renditionEvent.service';
import { Contents } from 'epubjs';
import { applyMobileStyles } from '../utils/style.util';
import { TOUCH_TIMING } from '@/constants/epub';
import { logger } from '@/utils/logger';
import { handleSelectionEnd } from './selection.service';
import { createCaretRange } from '../utils/selectionUtils';

/**
 * Sets up mobile text selection for the given contents.
 * Initializes touch event handlers and manages selection state for mobile devices.
 * @param props The setup properties for mobile selection.
 * @param contents The epub contents object containing document and window references.
 * @returns A cleanup function to remove event listeners and clear timers.
 */
export const setupMobileTextSelection = (props: SetupRenditionEventsProps, contents: Contents) => {
  // 2.handle logic.
  const touchState: TouchState = {
    isLongPress: false,
    startTime: 0,
    startPos: { x: 0, y: 0 },
    timer: null,
  };

  const { document, window } = contents;
  applyMobileStyles(document);

  const handleTouchStart = (e: TouchEvent) => {
    if (!props.selectionEnabled) {
      logger.log('Touch selection disabled - context menus are open');
      return;
    }

    const touch = e.touches[0];

    if (touchState.timer) {
      clearTimeout(touchState.timer);
    }

    // 2. Core state initialization
    touchState.isLongPress = false;
    touchState.startTime = Date.now();
    touchState.startPos = { x: touch.clientX, y: touch.clientY };

    // 3. Long press setup
    touchState.timer = setTimeout(() => {
      touchState.isLongPress = true;
      startSelection(touch, document, window);
    }, TOUCH_TIMING.LONG_PRESS_DURATION);
  };

  const handleTouchMove = (e: TouchEvent) => {
    // 1. Input validation
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];

    // 2. Core processing
    if (touchState.isLongPress) {
      extendSelection(touch, document, window);
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const duration = Date.now() - touchState.startTime;

    // 1. Input validation and cleanup
    if (touchState.timer) {
      clearTimeout(touchState.timer);
      touchState.timer = null;
    }

    // 2. Core processing
    if (touchState.isLongPress) {
      completeSelection(
        document,
        props.onSelectionCompleted,
        touchState.startPos // Use startPos for long press
      );
    } else if (duration < TOUCH_TIMING.REGULAR_TAP_THRESHOLD) {
      completeSelection(
        document,
        props.onSelectionCompleted,
        { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY } // Use release pos for tap
      );
    }

    // 3. State reset
    touchState.isLongPress = false;
  };

  // 3. Output and cleanup
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });

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
 * Starts text selection at the specified touch coordinates.
 * Identifies the target element and creates an initial selection range.
 * @param touch The touch event containing coordinates.
 * @param document The document object for DOM manipulation.
 * @param window The window object for selection operations.
 */
const startSelection = (touch: Touch, document: Document, window: Window) => {
  // 1. Input validation and targeting
  const target = document.elementFromPoint(
    touch.clientX - window.scrollX,
    touch.clientY - window.scrollY
  );

  if (target?.closest('p, div, span, h1, h2, h3, h4, h5, h6')) {
    // 2. Core selection logic
    const range = createCaretRange(document, window, touch.clientX, touch.clientY);
    if (range) {
      // 3. Selection application
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }
};

/**
 * Extends the current text selection during touch movement.
 * Updates the selection range to include text from the original start point to the current touch position.
 * @param touch The touch event containing current coordinates.
 * @param document The document object for DOM manipulation.
 * @param window The window object for selection operations.
 */
const extendSelection = (touch: Touch, document: Document, window: Window) => {
  // 1. Input validation
  const selection = window.getSelection();

  if (selection && selection.rangeCount > 0) {
    try {
      // 2. Core extension logic
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
      // 3. Error handling
      logger.error('Selection extension failed:', error);
    }
  }
};

/**
 * Completes the selection process and triggers the completion callback.
 * Handles the finalization of text selection with a configurable delay.
 * @param document The document object containing the selection.
 * @param onSelectionCompleted Callback function to handle the selection result.
 */
const completeSelection = (
  document: Document,
  onSelectionCompleted: (selectInfo: SelectInfo) => void,
  lastTouchPos?: { x: number; y: number }
) => {
  // 1. Input validation
  if (!document || typeof onSelectionCompleted !== 'function') {
    logger.error('Invalid parameters for completeSelection');
    return;
  }

  // 2. Delayed processing
  setTimeout(() => {
    // 3. Callback execution
    handleSelectionEnd(document, onSelectionCompleted, lastTouchPos);
  }, TOUCH_TIMING.SELECTION_DELAY);
};
