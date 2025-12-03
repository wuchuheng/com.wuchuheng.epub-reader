import { Rendition } from 'epubjs';
import { logger } from '../../../utils/logger';
import { RenditionLocation } from '../hooks/useEpubReader';

/**
 * Creates navigation functions for the EPUB reader.
 * @param rendition The EPUB rendition instance.
 * @param currentLocation A ref to the current rendition location.
 * @returns An object containing navigation functions.
 */
export const createNavigationFunctions = (
  rendition: Rendition,
  currentLocation: React.MutableRefObject<RenditionLocation | null>
) => ({
  goToNext: () => {
    if (currentLocation.current?.atEnd) {
      logger.warn('Reached the end of the book');
      return;
    }
    rendition.next();
  },

  goToPrev: () => {
    if (currentLocation.current?.atStart) {
      logger.log('Reached the start of the book');
      return;
    }
    rendition.prev();
  },

  goToSelectChapter: (href: string) => rendition.display(href),
});
