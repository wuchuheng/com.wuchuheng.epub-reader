import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReaderHeader } from './components/ReaderHeader';
import { ReaderHelpOverlay } from './components/ReaderHelpOverlay';
import { Book } from 'epubjs';
import { Loading } from './components/Loading';
import { getBookByBookId } from '../../services/EPUBMetadataService';
import { MenuButton } from './components/MenuButton';
import { ReaderFooter } from './components/ReaderFooter';
import { TOCSidebar } from './components/TOCSidebar';
import { InvalidBookError } from './components/ErrorRender';
import { useReader } from './hooks/useEpubReader';
import { ContextMenu, ContextMenuItem, SelectInfo } from '../../types/epub';
import ContextMenuComponent from './components/ContextMenu';
import { NextPageButton, PrevPageButton } from './components/directory/NextPageButton';
import { useContextMenuSettings } from '../ContextMenuSettingsPage/hooks/useContextMenuSettings';

/**
 * Complete EPUB reader page component
 * Integrates all reader components into a cohesive reading experience
 * Follows the design specifications from DESIGN.md
 */
export const EpubReader: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;
    let isMounted = true;
    getBookByBookId(bookId)
      .then((loadedBook) => {
        if (!isMounted) return;
        setBook(loadedBook);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load book:', err);
        setError('Failed to load book. Please try again later.');
      });
    return () => {
      isMounted = false;
    };
  }, [bookId]);

  useEffect(
    () => () => {
      book?.destroy();
    },
    [book]
  );

  if (!bookId || error) return <InvalidBookError error={error} />;
  if (!book)
    return (
      <div className="flex h-screen w-screen flex-1 items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );

  return <EpubReaderRender book={book!} />;
};

type EpubReaderRenderProps = {
  book: Book;
};

type ContextMenuEntry = ContextMenu & {
  id: number;
  parentId: number | null;
  selectionId: number;
};

const clampRatio = (value: number) => {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const EpubReaderRender: React.FC<EpubReaderRenderProps> = (props) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [tocVisible, setTocVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { settings: contextMenuSettings, updatePinnedMaximized } = useContextMenuSettings();
  const activeTools = useMemo(
    () => contextMenuSettings.items.filter((item) => item.enabled !== false),
    [contextMenuSettings.items]
  );
  const [menuStack, setMenuStack] = useState<ContextMenuEntry[]>([]);
  const selectionCounterRef = useRef(0);
  const menuIdRef = useRef(0);
  const lastSelectionTimeRef = useRef(0);

  const markSelectionActivity = useCallback(() => {
    lastSelectionTimeRef.current = Date.now();
  }, []);

  const onToggleToc = () => {
    if (tocVisible) {
      setTocVisible(false);
    } else {
      setTocVisible(true);
      if (menuVisible) setMenuVisible(false);
    }
  };

  const clickHandlerRef = useRef<(e: MouseEvent) => void>(() => {});

  const getSupportedTools = useCallback(
    (words: string): ContextMenuItem[] => {
      const trimmedWords = words.trim();
      const wordCount = trimmedWords.split(/\s+/).filter(Boolean).length;
      const isSingleWord = wordCount === 1;

      return activeTools.filter((tool) => {
        if (isSingleWord) {
          return tool.supportsSingleWord !== false;
        }
        return tool.supportsMultiWord !== false;
      });
    },
    [activeTools]
  );

  const createMenuEntry = (
    info: SelectInfo,
    parentId: number | null = null
  ): ContextMenuEntry | null => {
    const trimmedWords = info.words.trim();
    if (trimmedWords === '') {
      return null;
    }

    const supportedTools = getSupportedTools(trimmedWords);
    if (supportedTools.length === 0) {
      return null;
    }

    selectionCounterRef.current += 1;
    menuIdRef.current += 1;

    return {
      id: menuIdRef.current,
      parentId,
      selectionId: selectionCounterRef.current,
      tabIndex: 0,
      ...info,
    };
  };

  const pushBaseMenu = (info: SelectInfo) => {
    const supportedTools = getSupportedTools(info.words);
    if (supportedTools.length === 0) {
      if (activeTools.length === 0) {
        alert('No enabled tools available. Enable one in Settings > Context Menu.');
      } else {
        alert('No tools support this selection length. Enable single or multi-word support in Settings.');
      }
      setMenuStack([]);
      return;
    }

    const entry = createMenuEntry(info, null);
    if (!entry) {
      setMenuStack([]);
      return;
    }

    setMenuStack([entry]);
  };

  const pushDrilldownMenu = (parentId: number, info: SelectInfo) => {
    const supportedTools = getSupportedTools(info.words);
    if (supportedTools.length === 0) {
      if (activeTools.length === 0) {
        alert('No enabled tools available. Enable one in Settings > Context Menu.');
        setMenuStack([]);
      } else {
        alert('No tools support this selection length. Enable single or multi-word support in Settings.');
      }
      return;
    }

    const entry = createMenuEntry(info, parentId);
    if (!entry) return;

    setMenuStack((prev) => [...prev, entry]);
  };

  const removeMenuAndChildren = (id: number) => {
    setMenuStack((prev) => {
      const idsToRemove = new Set<number>();
      const collect = (targetId: number) => {
        idsToRemove.add(targetId);
        prev.forEach((entry) => {
          if (entry.parentId === targetId) {
            collect(entry.id);
          }
        });
      };

      collect(id);

      return prev.filter((entry) => !idsToRemove.has(entry.id));
    });
  };

  const updateTabIndex = (id: number, tabIndex: number) => {
    setMenuStack((prev) => prev.map((entry) => (entry.id === id ? { ...entry, tabIndex } : entry)));
  };

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
    book: props.book,
    onClick: (e) => clickHandlerRef.current(e),
    onSelect: (selectedInfo: SelectInfo) => {
      lastSelectionTimeRef.current = Date.now();
      pushBaseMenu(selectedInfo);
      setMenuVisible(false);
      setTocVisible(false);
    },
    onSelectionActivity: markSelectionActivity,
  });

  const getViewportRatio = useCallback((event: MouseEvent) => {
    const view = event.view || window;
    const frameElement = view.frameElement as HTMLElement | null;
    const frameRect = frameElement?.getBoundingClientRect();
    const fallbackWidth = view.visualViewport?.width || view.innerWidth || window.innerWidth || 0;

    let widthSource = 'fallback';
    let sourceWidth = fallbackWidth;
    let relativeX = event.clientX;

    if (frameRect && frameRect.width > 0) {
      widthSource = 'frameRect';
      sourceWidth = frameRect.width;
      relativeX = event.clientX - frameRect.left;
    }

    const ratio = sourceWidth ? clampRatio(relativeX / sourceWidth) : 0.5;

    console.log('Zone debug', {
      clientX: event.clientX,
      screenX: event.screenX,
      pageX: event.pageX,
      ratio,
      widthSource,
      sourceWidth,
      frameLeft: frameRect?.left ?? null,
      frameWidth: frameRect?.width ?? null,
      relativeX,
      fallbackWidth,
    });

    return ratio;
  }, []);

  // Smart Zone Click Handler
  useEffect(() => {
    clickHandlerRef.current = (event: MouseEvent) => {
      // 0. Ignore if selection just happened (prevents conflict with Context Menu)
      if (Date.now() - lastSelectionTimeRef.current < 500) {
        return;
      }

      // 1. Close TOC if open
      if (tocVisible) {
        setTocVisible(false);
        return;
      }

      // 2. Close Context Menu if open
      if (menuStack.length > 0) {
        setMenuStack([]);
        return;
      }

      // 3. Smart Zones
      const ratio = getViewportRatio(event);

      console.log(`Zone Interaction: ratio=${ratio.toFixed(3)}`);

      if (ratio < 0.2) {
        console.log('Trigger: Prev Page');
        onPrev();
      } else if (ratio > 0.8) {
        console.log('Trigger: Next Page');
        onNext();
      } else {
        console.log('Trigger: Toggle Menu');
        setMenuVisible((prev) => !prev);
      }
    };
  }, [getViewportRatio, onPrev, onNext, tocVisible, menuStack.length]);

  useEffect(() => {
    if (activeTools.length === 0) {
      setMenuStack([]);
      return;
    }

    setMenuStack((prev) =>
      prev.map((entry) => {
        if (entry.tabIndex === null) {
          return entry;
        }
        if (entry.tabIndex < 0 || entry.tabIndex >= activeTools.length) {
          return { ...entry, tabIndex: 0 };
        }
        return entry;
      })
    );
  }, [activeTools.length]);

  useEffect(() => {
    // Add this to your EPUB reader's JavaScript
    window.addEventListener('keydown', (event) => {
      console.log('Keydown event:', event.key, event.code, event.keyCode); // Debug: Check what values are captured

      const key = event.key || event.code; // Fallback to handle variations

      if (key === 'AudioVolumeUp' || key === 'VolumeUp' || event.keyCode === 183) {
        event.preventDefault(); // Try to stop system volume change (may not always work)
        console.log('Volume Up detected - Go to next page');
        onNext();

        // yourEpubReader.nextPage();
      } else if (key === 'AudioVolumeDown' || key === 'VolumeDown' || event.keyCode === 182) {
        event.preventDefault();
        console.log('Volume Down detected - Go to previous page');
        onPrev();
        // yourEpubReader.previousPage();
      }
    });
  }, [onPrev, onNext]);

  return (
    <div className="relative flex h-screen flex-col bg-white">
      <ReaderHeader
        visible={menuVisible}
        onOpenToc={onToggleToc}
        onHelpClick={() => setShowHelp(true)}
      />
      {showHelp && <ReaderHelpOverlay onClose={() => setShowHelp(false)} />}
      {menuStack.map((menu, index) => {
        const supportedItems = getSupportedTools(menu.words);
        return (
          <ContextMenuComponent
            key={menu.id}
            onChangeIndex={(tabIndex) => updateTabIndex(menu.id, tabIndex)}
            tabIndex={menu.tabIndex}
            words={menu.words}
            context={menu.context}
            selectionId={menu.selectionId}
            items={supportedItems}
            api={contextMenuSettings.api}
            apiKey={contextMenuSettings.key}
            defaultModel={contextMenuSettings.defaultModel}
            isTopMost={index === menuStack.length - 1}
            onClose={() => removeMenuAndChildren(menu.id)}
            onDrilldownSelect={(info) => pushDrilldownMenu(menu.id, info)}
            pinnedMaximized={contextMenuSettings.pinnedMaximized ?? false}
            onPinnedChange={updatePinnedMaximized}
            zIndex={50 + index}
          />
        );
      })}
      <TOCSidebar
        isOpen={tocVisible}
        currentChapter={currentChapterHref}
        onChapterSelect={goToSelectChapter}
        onToggle={() => setTocVisible(false)}
        tableOfContents={tableOfContents}
      />

      {/* Toggle button to show menu when hidden */}
      <MenuButton visible={!menuVisible} setVisible={setMenuVisible} />

      <PrevPageButton onClick={onPrev} />
      <NextPageButton onClick={onNext} />

      <div className="relative h-full w-full" ref={containerRef} />

      <ReaderFooter
        visible={menuVisible}
        currentPage={currentPage}
        totalPages={totalPages}
        onNext={onNext}
        onPrev={onPrev}
      />
    </div>
  );
};
