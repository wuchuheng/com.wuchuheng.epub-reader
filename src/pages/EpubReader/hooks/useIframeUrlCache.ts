import { useRef, useEffect } from 'react';

/**
 * Hook to maintain a cache of iframe URLs for each tool index.
 * Prevents iframes from reloading when they don't need to.
 */
export const useIframeUrlCache = (selectionId: number) => {
  // Cache structure: selectionId -> toolIndex -> resolvedUrl
  const cacheRef = useRef<Record<number, Record<number, string>>>({});

  const getCachedUrl = (toolIndex: number): string | undefined =>
    cacheRef.current[selectionId]?.[toolIndex];

  const setCachedUrl = (toolIndex: number, url: string) => {
    if (!cacheRef.current[selectionId]) {
      cacheRef.current[selectionId] = {};
    }
    cacheRef.current[selectionId][toolIndex] = url;
  };

  // Clean up cache for old selectionIds to prevent memory leaks
  useEffect(() => {
    const currentSelectionId = selectionId;
    const cachedIds = Object.keys(cacheRef.current).map(Number);

    // Keep only the current selection's cache and maybe the immediate previous one if needed
    // For now, we'll just ensure we don't grow indefinitely
    if (cachedIds.length > 5) {
      const idsToRemove = cachedIds.filter((id) => id !== currentSelectionId);
      idsToRemove.forEach((id) => {
        delete cacheRef.current[id];
      });
    }
  }, [selectionId]);

  return { getCachedUrl, setCachedUrl };
};
