import { Book, Rendition } from 'epubjs';
import Section from 'epubjs/types/section';
import { EpubIframeView, SelectInfo, TouchState } from '../../../types/epub';
import { latestReadingLocation, RenditionLocation } from '../hooks/useEpubReader';
import { setupMobileTextSelection } from './mobileSelection.service';
import { handleComputerSelection } from './computerSelection.service';

export type SetupRenditionEventsProps = {
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

// Device detection
export const isMobileDevice = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/**
 * Sets up event listeners for the EPUB.js rendition.
 * @param props The setup properties for rendition events.
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

    props.rendition.on('click', () => {
      if (props.onClick) props.onClick();
    });

    if (isMobileDevice()) {
      setupMobileTextSelection(props);
    } else {
      handleComputerSelection(props, iframeView);
    }
  });
};
