import { useEffect } from 'react';

/**
 * Implements keyboard navigation for the EPUB reader.
 * @param goToNext
 * @param goToPrev
 */
export const useKeyboardNavigation = (goToNext: () => void, goToPrev: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if user is selecting text
      if (window.getSelection()?.toString().trim()) return;

      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);
};
