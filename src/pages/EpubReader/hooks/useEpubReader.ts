import { useEffect, useRef, useState } from 'react';
import { Book } from 'epubjs';
import { logger } from '../../../utils/logger';
import { TocItem } from '../../../types/epub';
import Section from 'epubjs/types/section';
import { useParams } from 'react-router-dom';

// Latest reading location
const latestReadingLocation = {
  prefix: 'latestReadingLocation_',
  getCfi: (key: string): string | null =>
    localStorage.getItem(`${latestReadingLocation.prefix}${key}`),
  setCfi: (key: string, cfi: string): void => {
    localStorage.setItem(`${latestReadingLocation.prefix}${key}`, cfi);
  },
};

// Type for the location object from rendition's 'relocated' event
type RenditionLocation = {
  start: {
    index: number;
    href: string;
    cfi: string;
    location: number;
    percentage: number;
    displayed: {
      page: number;
      total: number;
    };
  };
  end: {
    index: number;
    href: string;
    cfi: string;
    location: number;
    percentage: number;
    displayed: {
      page: number;
      total: number;
    };
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
};

export const useReader = (props: UseReaderProps): UseReaderReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const goToNextRef = useRef<() => void>(() => {});
  const goToPrevRef = useRef<() => void>(() => {});
  const goToSelectChapterRef = useRef<(href: string) => void>(() => {});
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([]);
  const currentRenditionLocationRef = useRef<RenditionLocation | null>(null); // Ref to store the latest location object
  const [currentChapterHref, setCurrentChapterHref] = useState<string>('');

  // Access the bookId from the route /reader/:bookId via react-router hooks.
  const { bookId } = useParams<{ bookId: string }>();

  const onRenderBook = async () => {
    logger.log('Rendering book:', props.book);
    // 2. Handle logic.
    // 2.1 Render book.
    const rendition = props.book.renderTo(containerRef.current!, {
      width: '100%',
      height: '100%',
      spread: 'always',
      minSpreadWidth: 800,
      manager: 'continuous',
      flow: 'paginated',
      allowScriptedContent: true,
    });

    // 2.2 Display first page.
    // Listen to 'relocated' event to update the location ref
    rendition.on('relocated', (location: RenditionLocation) => {
      currentRenditionLocationRef.current = location;

      // Update current page based on location
      const percentage = props.book.locations.percentageFromCfi(location.start.cfi);
      const total = props.book.locations.length();
      let page = Math.floor(percentage * total) + 1;
      if (percentage >= 1) {
        page = total;
      }

      setCurrentPage(page);

      // Save the current location for this file
      latestReadingLocation.setCfi(bookId!, location.start.cfi);
    });

    rendition.on('rendered', (section: Section) => {
      const current = props.book.navigation.get(section.href);
      if (current) {
        // Update the current chapter information
        setCurrentChapterHref(current.href);
      }
    });

    const latestCfi = latestReadingLocation.getCfi(bookId!);
    rendition.display(latestCfi || undefined);

    // 2.3 Bind navigation events.
    await props.book.ready;

    const chars = 1600;
    await props.book.locations.generate(chars);

    const totalPages = props.book.locations.length();
    setTotalPages(totalPages);

    logger.log('Book is ready:', props.book);

    // 2.3.1 Bind prev event.
    goToNextRef.current = () => {
      // 1. Check if the latest page is displayed using the ref
      if (currentRenditionLocationRef.current?.atEnd) {
        logger.warn('Reached the end of the book');
        return;
      }

      rendition.next();
    };

    // 2.3.2 Bind prev event.
    goToPrevRef.current = () => {
      // 1. Check if the latest page is displayed using the ref
      if (currentRenditionLocationRef.current?.atStart) {
        logger.log('Reached the start of the book');
        return;
      }

      rendition.prev();
    };

    // 2.4 Extract and set table of contents
    const toc = props.book.navigation.toc;
    setTableOfContents(toc);

    // 2.5 Bind navigation events while the specific chapter selection.
    goToSelectChapterRef.current = (href: string) => rendition.display(href);
  };

  // Bind the direction keys
  useEffect(() => {
    const keyListener = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevRef.current?.();
      if (e.key === 'ArrowRight') goToNextRef.current?.();
    };

    document.addEventListener('keydown', keyListener);
    return () => document.removeEventListener('keydown', keyListener);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      logger.log('Container ref is set:', containerRef.current);
      onRenderBook();
    }
  }, [props.book, containerRef]);

  return {
    containerRef,
    tableOfContents,
    totalPages,
    currentPage,
    currentChapterHref,
    goToNext: goToNextRef.current,
    goToPrev: goToPrevRef.current,
    goToSelectChapter: goToSelectChapterRef.current,
  };
};
