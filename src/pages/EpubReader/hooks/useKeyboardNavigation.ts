import { useEffect } from 'react';

/**
 * Configuration options for keyboard navigation.
 */
interface KeyboardNavigationOptions {
  /**
   * Whether to enable volume keys for navigation (typically for mobile).
   * @default false
   */
  enableVolumeKeys?: boolean;
}

/**
 * Hook for handling keyboard navigation events.
 * @param onNext Callback for navigating to the next page.
 * @param onPrev Callback for navigating to the previous page.
 * @param options Configuration options.
 */
export const useKeyboardNavigation = (
  onNext: () => void,
  onPrev: () => void,
  options: KeyboardNavigationOptions = {}
) => {
  const { enableVolumeKeys = false } = options;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      // Standard arrow keys
      if (key === 'ArrowRight' || key === 'ArrowDown') {
        onNext();
      } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
        onPrev();
      }

      // Volume keys (mostly for mobile/tablet or specific keyboards)
      if (enableVolumeKeys) {
        if (key === 'AudioVolumeUp' || key === 'VolumeUp' || event.keyCode === 183) {
          event.preventDefault();
          onNext();
        } else if (key === 'AudioVolumeDown' || key === 'VolumeDown' || event.keyCode === 182) {
          event.preventDefault();
          onPrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, enableVolumeKeys]);
};
