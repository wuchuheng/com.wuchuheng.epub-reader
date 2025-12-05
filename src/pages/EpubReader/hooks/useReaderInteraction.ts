import { useCallback, useEffect, useRef, useState } from 'react';
import { useReader } from './useEpubReader';
import { Book } from 'epubjs';
import { SelectInfo } from '../../../types/epub';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../../utils/logger';
import { getWordCount } from '../utils/domUtils';
import { DEFAULT_CONFIG } from '../../../constants/epub';

interface UseReaderInteractionProps {
  book: Book;
  menuStackLength: number;
  isMenuOpenRef: React.RefObject<boolean>;
  onMenuClose: () => void;
  onSelection: (info: SelectInfo) => void;
  maxSelectedWords?: number;
  onShowMessage?: (msg: string) => void;
}

const clampRatio = (value: number) => {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

export const useReaderInteraction = ({
  book,
  menuStackLength,
  onMenuClose,
  onSelection,
  isMenuOpenRef,
  maxSelectedWords,
  onShowMessage,
}: UseReaderInteractionProps) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [tocVisible, setTocVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const clickHandlerRef = useRef<() => void>(() => {});
  const lastSelectionTimeRef = useRef(0);
  const navigate = useNavigate();

  const markSelectionActivity = useCallback(() => {
    lastSelectionTimeRef.current = Date.now();
  }, []);

  const {
    containerRef,
    goToNext: onNext,
    goToPrev: onPrev,
    tableOfContents,
    goToSelectChapter,
    currentPage,
    totalPages,
    currentChapterHref,
  } = useReader({
    book,
    onClick: () => clickHandlerRef.current(),
    // TODO: These comments should bo removed after testing.
    onSelect: (selectedInfo: SelectInfo) => {
      setMenuVisible(false);
      setTocVisible(false);

      const limit = maxSelectedWords ?? DEFAULT_CONFIG.DEFAULT_MAX_SELECTED_WORDS;
      const count = getWordCount(selectedInfo.words);

      if (count > limit) {
        onShowMessage?.('Selection exceeds the max word limit. Reduce your selection to continue.');
        return;
      }

      console.log('Selection completed:', selectedInfo);
      lastSelectionTimeRef.current = Date.now();
      onSelection(selectedInfo);
    },
    onSelectionActivity: markSelectionActivity,
    isMenuOpenRef,
  });

  const getViewportRatio = useCallback((event: MouseEvent) => {
    const view = event.view || window;
    const frameElement = view.frameElement as HTMLElement | null;
    const frameRect = frameElement?.getBoundingClientRect();
    const fallbackWidth = view.visualViewport?.width || view.innerWidth || window.innerWidth || 0;

    let sourceWidth = fallbackWidth;
    let relativeX = event.clientX;

    if (frameRect && frameRect.width > 0) {
      sourceWidth = frameRect.width;
      relativeX = event.clientX - frameRect.left;
    }

    return sourceWidth ? clampRatio(relativeX / sourceWidth) : 0.5;
  }, []);

  useEffect(() => {
    clickHandlerRef.current = () => {
      console.log('Click detected');

      setMenuVisible((prev) => !prev);
    };
  }, [getViewportRatio, onPrev, onNext, tocVisible, menuStackLength, onMenuClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuStackLength > 0) {
        logger.log('[EpubReader] ESC pressed, closing topmost menu');
        navigate(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuStackLength, navigate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key || event.code;

      if (key === 'AudioVolumeUp' || key === 'VolumeUp' || event.keyCode === 183) {
        event.preventDefault();
        onNext();
      } else if (key === 'AudioVolumeDown' || key === 'VolumeDown' || event.keyCode === 182) {
        event.preventDefault();
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev]);

  const onToggleToc = () => {
    if (tocVisible) {
      setTocVisible(false);
    } else {
      setTocVisible(true);
      if (menuVisible) setMenuVisible(false);
    }
  };

  return {
    containerRef,
    menuVisible,
    setMenuVisible,
    tocVisible,
    setTocVisible,
    showHelp,
    setShowHelp,
    onToggleToc,
    onNext,
    onPrev,
    tableOfContents,
    goToSelectChapter,
    currentPage,
    totalPages,
    currentChapterHref,
  };
};
