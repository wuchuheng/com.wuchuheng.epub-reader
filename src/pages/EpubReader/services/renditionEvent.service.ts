import { Book, Rendition } from 'epubjs';
import Section from 'epubjs/types/section';
import { logger } from '../../../utils/logger';
import { EpubIframeView, SelectInfo } from '../../../types/epub';
import { handleSelectionEnd as handleSelectionEnd } from '../services/selection.service';
import { latestReadingLocation, RenditionLocation } from '../hooks/useEpubReader';

type SetupRenditionEventsProps = {
  rendition: Rendition;
  book: Book;
  bookId: string;
  onClick: (() => void) | undefined;
  onSelectionCompleted: (selectInfo: SelectInfo) => void;
  setter: {
    setCurrentPage: (page: number) => void;
    setCurrentChapterHref: (href: string) => void;
    setCurrentLocation: (location: RenditionLocation) => void;
  };
};

/**
 * Sets up event listeners for the EPUB.js rendition.
 * @param rendition The EPUB.js rendition instance.
 * @param book The EPUB.js book instance.
 * @param bookId The ID of the book.
 * @param onSelectionHandler The callback to call when text is selected.
 * @param onContentClick The callback to call when the content is clicked.
 * @param touchState The mutable ref object to track touch state.
 * @param setters
 */
export const setupRenditionEvents = (props: SetupRenditionEventsProps) => {
  // Location tracking
  props.rendition.on('relocated', (location: RenditionLocation) => {
    props.setter.setCurrentLocation(location);

    const percentage = props.book.locations.percentageFromCfi(location.start.cfi);
    const total = props.book.locations.length();
    const page = percentage >= 1 ? total : Math.floor(percentage * total) + 1;

    props.setter.setCurrentPage(page);
    latestReadingLocation.set(props.bookId, location.start.cfi);
  });

  // Chapter tracking
  props.rendition.on('rendered', (section: Section, iframeView: EpubIframeView) => {
    const current = props.book.navigation.get(section.href);
    if (current) {
      props.setter.setCurrentChapterHref(current.href);
    }

    props.rendition.on('touchend', () => {
      logger.log('Touch end event detected');

      const doc = iframeView.document;
      handleSelectionEnd(doc, props.onSelectionCompleted);
    });

    props.rendition.on('mouseup', (_event: MouseEvent) => {
      logger.log(`Mouse up event detected`);
      const doc = iframeView.document;
      handleSelectionEnd(doc, props.onSelectionCompleted);
    });

    props.rendition.on('click', () => {
      if (props.onClick) props.onClick();
    });
    props.rendition.on('select', () => {
      debugger;
    });
  });
};
