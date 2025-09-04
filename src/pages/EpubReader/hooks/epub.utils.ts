import { Book, Contents, Rendition } from 'epubjs';
import { latestReadingLocation, RenditionLocation } from './useEpubReader';
import Section from 'epubjs/types/section';
import { logger } from '../../../utils/logger';
import { SelectInfo } from '../../../types/epub';
import { handleSelectionEnd as handleSelectionEnd } from '../services/selection.service';

/**
 * Interface representing the IframeView from epub.js
 * This is the second parameter passed to the 'rendered' event handler
 */
interface EpubIframeView {
  /** The actual HTML iframe element */
  iframe: HTMLIFrameElement;
  /** The document object inside the iframe */
  document: Document;
  /** The window object inside the iframe */
  window: Window;
  /** Contents object for manipulating the iframe content */
  contents: Contents;
}

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
  });
};

/**
 * Creates a storage manager for managing local storage with a specific prefix.
 * @param prefix The prefix to use for all storage keys.
 * @returns An object with `get` and `set` methods for interacting with local storage.
 */
export const createStorageManager = (prefix: string) => ({
  get: (key: string): string | null => localStorage.getItem(`${prefix}${key}`),
  set: (key: string, value: string): void => localStorage.setItem(`${prefix}${key}`, value),
});

/**
 * Finds the closest paragraph element to the given node.
 * @param node The starting node.
 * @returns The closest paragraph element or null if not found.
 */
export const getContext = (range: Range): string => {
  const paragraphTags = ['p', 'div', 'section', 'article', 'li'];
  let current: Node | null = range.commonAncestorContainer;
  while (current && current.nodeType !== Node.DOCUMENT_NODE) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const element = current as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      if (paragraphTags.includes(tagName) || element.classList.contains('paragraph')) {
        return element.textContent || '';
      }
    }
    current = current.parentNode;
  }

  return '';
};
