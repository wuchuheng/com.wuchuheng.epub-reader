import { useEffect } from 'react';

/**
 * Auto-scrolls the container to bottom when the dependency changes,
 * but only if the user is near the bottom (to avoid hijacking user scroll).
 */
export function useAutoScrollOnUpdate(
  containerRef: React.RefObject<HTMLDivElement>,
  dependency: unknown,
  scrollToBottom: () => void,
  nearBottomThreshold = 120
) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 1. Input: measure current scroll state
    const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);

    // 2. Processing: scroll only if user is near the bottom
    if (distanceToBottom <= nearBottomThreshold) {
      scrollToBottom();
    }
    // 3. Output: none
  }, [containerRef, dependency, nearBottomThreshold, scrollToBottom]);
}
