import { useEffect } from 'react';

type KeyboardNavOptions = {
  enableVolumeKeys?: boolean;
};

/**
 * Implements keyboard navigation for the EPUB reader.
 * @param goToNext Function to navigate to the next page
 * @param goToPrev Function to navigate to the previous page
 * @param options Optional configuration for navigation behavior
 */
export const useKeyboardNavigation = (
  goToNext: () => void,
  goToPrev: () => void,
  options?: KeyboardNavOptions
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Input handling
      // Don't navigate if user is selecting text
      if (window.getSelection()?.toString().trim()) return;

      // 2. Core processing
      // Standard arrow key navigation
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }

      // Mobile volume key navigation
      if (options?.enableVolumeKeys) {
        if (e.key === 'VolumeUp') {
          e.preventDefault(); // Attempt to suppress system volume change
          goToPrev();
        } else if (e.key === 'VolumeDown') {
          e.preventDefault();
          goToNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, options?.enableVolumeKeys]);
};
