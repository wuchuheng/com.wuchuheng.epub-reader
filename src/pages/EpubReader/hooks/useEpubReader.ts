import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Book, Rendition } from 'epubjs';
import { logger } from '../../../utils/logger';
import { SelectInfo, TocItem } from '../../../types/epub';
import { useParams } from 'react-router-dom';
import { createStorageManager } from './epub.utils';
import { debounce } from '@wuchuheng/helper';
import { RENDERING_CONFIG } from '../../../constants/epub';
import { createNavigationFunctions } from '../utils/navigationUtils';
import { isMobileDevice, setupRenditionEvents } from '../services/renditionEvent.service';
import { useKeyboardNavigation } from './useKeyboardNavigation';

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
  }, [bookId, onSelectionCompleted, props.book, props.isMenuOpenRef]);

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
