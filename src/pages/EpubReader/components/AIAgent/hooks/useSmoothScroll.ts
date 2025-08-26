import { useCallback, useEffect, useRef } from 'react';

/**
 * Provides a smooth scroll-to-bottom function for a scrollable container.
 * Handles RAF cancellation and dynamic target recalculation during streaming content.
 */
export function useSmoothScrollToBottom(
  containerRef: React.RefObject<HTMLDivElement>,
  duration = 600
) {
  const rafIdRef = useRef<number | null>(null);

  const scrollToBottom = useCallback(() => {
    // 1. Input: verify container exists
    const element = containerRef.current;
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
  }, [containerRef, duration]);

  // 3. Output: cleanup on unmount
  useEffect(
    () => () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    },
    []
  );

  return scrollToBottom;
}
