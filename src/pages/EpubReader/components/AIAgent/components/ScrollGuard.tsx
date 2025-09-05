import React, { useEffect, useRef, useCallback } from 'react';

type ScrollGuardProps = {
  /** Buffer zone in pixels. When the viewport is within this distance of the guard, it's considered visible. */
  bufferPx?: number;

  scrollContainer: HTMLDivElement | null;

  onGuardVisible?: (visible: boolean) => void;
};

/**
 * A scroll guard component that detects when the user scrolls within a buffer zone of the guard element.
 * Triggers the onGuardVisible callback when the scroll position is within the specified buffer distance.
 *
 * @example
 * ```tsx
 * <ScrollGuard
 *   bufferPx={200}
 *   scrollContainer={containerRef}
 *   onGuardVisible={(isVisible) => console.log('Guard visible:', isVisible)}
 * />
 * ```
 */
export const ScrollGuard: React.FC<ScrollGuardProps> = ({
  bufferPx = 80,
  scrollContainer,
  onGuardVisible,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  // Function to check if guard is visible within buffer zone
  const checkGuardVisibility = useCallback(() => {
    // 1. Input validation
    const guardElement = ref.current;
    if (!guardElement) return;
    if (!scrollContainer) return;

    // 2. Handle logic.
    // 2.1 Get the scrollbar position.
    const scrollTop = scrollContainer.scrollTop;

    // 2.2 Get the distance from the scrollbar to bottom.
    const distanceFromBottom =
      scrollContainer.scrollHeight - (scrollTop + scrollContainer.clientHeight);

    // 2.3 Make the visible as true when the distance from the scrollbar to bottom less then or equal the bufferPx.
    const isVisible = distanceFromBottom <= bufferPx;

    // 3. Output: trigger callback with visibility state
    if (onGuardVisible) {
      onGuardVisible(isVisible);
    }
  }, [bufferPx, onGuardVisible, scrollContainer]);

  useEffect(() => {
    // 1. Input validation and preparation
    const guardElement = ref.current;
    if (!guardElement) return;

    // Determine the scroll target (provided container or window)
    const scrollTarget = scrollContainer || window;

    // 2. Core processing: set up event listeners
    const handleScroll = () => {
      checkGuardVisibility();
    };

    const handleResize = () => {
      checkGuardVisibility();
    };

    // Add event listeners
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Initial check
    checkGuardVisibility();

    // 3. Cleanup: remove event listeners
    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [scrollContainer, checkGuardVisibility]);

  return (
    <div ref={ref} className="w-full text-center text-sm text-gray-400">
      -- You've reached the end! --
    </div>
  );
};
