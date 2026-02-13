import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Book, Rendition, Contents } from 'epubjs';
import { logger } from '../../../utils/logger';
import { SelectInfo, TocItem } from '../../../types/epub';
import { useParams } from 'react-router-dom';
import { createStorageManager } from './epub.utils';
import { debounce } from '@wuchuheng/helper';
import { RENDERING_CONFIG } from '../../../constants/epub';
import { createNavigationFunctions } from '../utils/navigationUtils';
import { isMobileDevice, setupRenditionEvents } from '../services/renditionEvent.service';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { useAppSelector } from '../../../store';
import { FONT_OPTIONS } from '../../../config/fonts';

// Types
export type RenditionLocation = {
  start: {
    index: number;
    href: string;
    cfi: string;
    location: number;
    percentage: number;
    displayed: { page: number; total: number };
  };
  end: {
    index: number;
    href: string;
    cfi: string;
    location: number;
    percentage: number;
    displayed: { page: number; total: number };
  };
  atStart: boolean;
  atEnd: boolean;
};

type UseReaderReturn = {
  containerRef: React.RefObject<HTMLDivElement>;
  tableOfContents: TocItem[];
  totalPages: number;
  currentPage: number;
  currentChapterHref: string;
  goToNext: () => void;
  goToPrev: () => void;
  goToSelectChapter: (href: string) => void;
};

type UseReaderProps = {
  book: Book;
  onClick?: () => void;
  onSelect: (selectedInfo: SelectInfo) => void;
  onSelectionActivity?: () => void;
  isMenuOpenRef: React.RefObject<boolean>;
};

export const latestReadingLocation = createStorageManager('latestReadingLocation_');

/**
 * Creates the configuration for the EPUB.js rendition.
 * @returns The rendition configuration object.
 */
const createRenditionConfig = () => ({
  width: RENDERING_CONFIG.WIDTH,
  height: RENDERING_CONFIG.HEIGHT,
  spread: RENDERING_CONFIG.SPREAD,
  minSpreadWidth: RENDERING_CONFIG.MIN_SPREAD_WIDTH,
  manager: RENDERING_CONFIG.MANAGER,
  flow: RENDERING_CONFIG.FLOW,
  allowScriptedContent: true,
});

/**
 * Custom hook for the EPUB reader.
 * @param props The props for the reader.
 * @returns The reader state and actions.
 */
export const useReader = (props: UseReaderProps): UseReaderReturn => {
  const { bookId } = useParams<{ bookId: string }>();
  const { typography } = useAppSelector((state) => state.settings);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const currentLocationRef = useRef<RenditionLocation | null>(null);
  const onSelectRef = useRef(props.onSelect);
  const onClickRef = useRef(props.onClick);
  const onSelectionActivityRef = useRef(props.onSelectionActivity);

  useEffect(() => {
    onSelectRef.current = props.onSelect;
    onClickRef.current = props.onClick;
    onSelectionActivityRef.current = props.onSelectionActivity;
  }, [props.onSelect, props.onClick, props.onSelectionActivity]);

  // State
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([]);
  const [currentChapterHref, setCurrentChapterHref] = useState<string>('');

  // Navigation functions
  const [navigation, setNavigation] = useState({
    goToNext: () => {},
    goToPrev: () => {},
    goToSelectChapter: (_: string) => {},
  });

  const onSelectionCompletedDebounced = useMemo(
    () =>
      debounce<SelectInfo>((selectedInfo: SelectInfo) => {
        console.log('selectedInfo', selectedInfo);
        if (selectedInfo) {
          logger.log(`Omit event:`, selectedInfo);
          onSelectRef.current(selectedInfo);
        } else {
          logger.log('Emit click event');
        }
      }, 200),
    []
  );

  const onSelectionCompleted = useCallback(
    (selectedInfo: SelectInfo) => {
      onSelectionActivityRef.current?.();
      onSelectionCompletedDebounced(selectedInfo);
    },
    [onSelectionCompletedDebounced]
  );

  // Main book rendering function
  const renderBook = useCallback(async () => {
    if (!containerRef.current) return;

    const rendition = props.book.renderTo(containerRef.current, createRenditionConfig());
    renditionRef.current = rendition;

    // Apply initial typography
    const selectedFont = FONT_OPTIONS.find((f) => f.id === typography.fontFamily) || FONT_OPTIONS[0];
    
    // Inject local font stylesheet into book iframe
    rendition.hooks.content.register((contents: import('epubjs').Contents) => {
      contents.addStylesheet('/fonts/base.css');
      if (selectedFont.url) {
        contents.addStylesheet(selectedFont.url);
      }
    });

    rendition.themes.font(selectedFont.family);
    rendition.themes.fontSize(`${typography.fontSize}%`);

    setupRenditionEvents({
      rendition,
      book: props.book,
      bookId: bookId!,
      onSelectionCompleted,
      onClick: () => onClickRef.current?.(),
      isMenuOpenRef: props.isMenuOpenRef,
      setter: {
        setCurrentPage,
        setCurrentChapterHref,
        setCurrentLocation: (location) => (currentLocationRef.current = location),
      },
    });

    const latestCfi = latestReadingLocation.get(bookId!);
    rendition.display(latestCfi || undefined);

    await props.book.ready;
    await props.book.locations.generate(RENDERING_CONFIG.LOCATION_CHAR_COUNT);
    setTotalPages(props.book.locations.length());
    setTableOfContents(props.book.navigation.toc);

    const nav = createNavigationFunctions(rendition, currentLocationRef);
    setNavigation(nav);
  }, [bookId, onSelectionCompleted, props.book, props.isMenuOpenRef, typography.fontFamily, typography.fontSize]);

  // Setup keyboard navigation
  useKeyboardNavigation(navigation.goToNext, navigation.goToPrev, {
    enableVolumeKeys: isMobileDevice(),
  });

  // Effects
  useEffect(() => {
    if (containerRef.current && props.book) {
      renderBook();
    }
  }, [props.book, renderBook]);

  // Update typography dynamically without full re-render if possible
  useEffect(() => {
    if (renditionRef.current) {
      const selectedFont = FONT_OPTIONS.find((f) => f.id === typography.fontFamily) || FONT_OPTIONS[0];
      
      const rendition = renditionRef.current;
      
      // Load the CSS if it has a URL
      if (selectedFont.url) {
        // Use getContents() to safely access all loaded section contents
        const contents = (rendition as unknown as { getContents: () => Contents[] }).getContents();
        if (Array.isArray(contents)) {
          contents.forEach((content: Contents) => {
            content.addStylesheet(selectedFont.url!);
          });
        }
      }

      // Apply font and size
      rendition.themes.font(selectedFont.family);
      rendition.themes.fontSize(`${typography.fontSize}%`);
      
      // Force a redraw of the current view to apply font changes
      // Check if manager exists to avoid TypeError
      if ((rendition as unknown as { manager: unknown }).manager) {
        const location = rendition.currentLocation() as unknown as RenditionLocation;
        if (location && location.start) {
          rendition.display(location.start.cfi);
        }
      }
    }
  }, [typography.fontFamily, typography.fontSize]);

  return {
    containerRef,
    tableOfContents,
    totalPages,
    currentPage,
    currentChapterHref,
    goToNext: navigation.goToNext,
    goToPrev: navigation.goToPrev,
    goToSelectChapter: navigation.goToSelectChapter,
  };
};
