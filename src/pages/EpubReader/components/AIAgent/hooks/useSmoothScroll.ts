import { debounce } from '@wuchuheng/helper';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * Return type for useSmoothScrollToBottom hook
 */
interface UseSmoothScrollReturn {
  /** Initiates smooth scroll to bottom of container */

  scrollToBottom: () => void;

  handleResumeAutoScroll: (e: React.MouseEvent | React.TouchEvent) => void;

  handleOnPauseAutoScroll: (e: React.MouseEvent | React.TouchEvent) => void;

  handleWheelEvent: (e: React.WheelEvent) => void;

  bufferPx: number;
}

type UseSmoothScrollProps = {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  isAutoScrollRef: React.MutableRefObject<boolean>;
  isGoToBottomRef: React.MutableRefObject<boolean>;
  duration?: number;
};

/**
 * Provides smooth scroll functionality for a scrollable container.
 * Handles RAF cancellation and dynamic target recalculation during streaming content.
 * Returns both scroll initiation and cancellation functions.
 */
export function useSmoothScrollToBottom({
  scrollContainerRef,

  /** Ref to track if the auto scroll is enabled */
  isAutoScrollRef,

  /** Ref to track if the scroll is at the bottom */
  isGoToBottomRef,

  duration = 600,
}: UseSmoothScrollProps): UseSmoothScrollReturn {
  const rafIdRef = useRef<number | null>(null);

  const scrollToBottom = useCallback(() => {
    // 1. Input: verify container exists
    if (scrollContainerRef === null) {
      return;
    }
    const element = scrollContainerRef.current;
    if (!element) return;

    // 2. Core: cancel previous RAF and animate with easing
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const startTime = performance.now();
    const startTop = element.scrollTop;
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const animate = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      // Recalculate target each frame for growing content
      const target = element.scrollHeight - element.clientHeight;
      element.scrollTop = startTop + (target - startTop) * eased;

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);
  }, [scrollContainerRef, duration]);

  const cancelScroll = useCallback(() => {
    // 1. Check if there's an active animation
    if (rafIdRef.current) {
      // 2. Cancel the animation frame
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  // 3. Output: cleanup on unmount
  useEffect(
    () => () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    },
    []
  );

  const handleOnPauseAutoScroll = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    isAutoScrollRef.current = false;
    cancelScroll();
    console.log('Pause auto scroll');
  };

  const bufferPx = 100;

  const handleResumeAutoScroll = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    isAutoScrollRef.current = true;

    isGoToBottomRef.current =
      e.currentTarget.scrollTop + e.currentTarget.clientHeight >=
      e.currentTarget.scrollHeight - bufferPx;
    console.log('Resume auto scroll. Is at bottom:', isGoToBottomRef.current);
  };

  const handleWheelStopEvent = useMemo(
    () =>
      debounce<void>(() => {
        isAutoScrollRef.current = true;
      }, 200),
    [isAutoScrollRef]
  );

  const handleWheelEvent = () => {
    cancelScroll();
    isAutoScrollRef.current = false;
    handleWheelStopEvent();
  };

  return {
    scrollToBottom,
    handleOnPauseAutoScroll,
    handleResumeAutoScroll,
    bufferPx,
    handleWheelEvent,
  };
}
