import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReaderHeader } from './components/ReaderHeader';
import { Book } from 'epubjs';
import { Loading } from './components/Loading';
import { getBookByBookId } from '../../services/EPUBMetadataService';
import { MenuButton } from './components/MenuButton';
import { ReaderFooter } from './components/ReaderFooter';
import { TOCSidebar } from './components/TOCSidebar';
import { InvalidBookError } from './components/ErrorRender';
import { useReader } from './hooks/useEpubReader';
import { ContextMenu, SelectInfo, SelectionSituation } from '../../types/epub';
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
  if (!book) return <Loading />;

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

const EpubReaderRender: React.FC<EpubReaderRenderProps> = (props) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [tocVisible, setTocVisible] = useState(false);
  const { settings: contextMenuSettings } = useContextMenuSettings();
  const activeTools = useMemo(
    () => contextMenuSettings.items.filter((item) => item.enabled !== false),
    [contextMenuSettings.items]
  );
  const [menuStack, setMenuStack] = useState<ContextMenuEntry[]>([]);
  const selectionCounterRef = useRef(0);
  const menuIdRef = useRef(0);

  const onToggleToc = () => {
    if (tocVisible) {
      setTocVisible(false);
    } else {
      setTocVisible(true);
      if (menuVisible) setMenuVisible(false);
    }
  };

  const onClickReaderView = () => {
    setMenuVisible(false);
    setTocVisible(false);
  };

  const resolveDefaultTabIndex = (words: string): number | null => {
    if (activeTools.length === 0) {
      return null;
    }

    const wordCount = words.trim().split(/\s+/).length;
    const situation: SelectionSituation = wordCount === 1 ? 'word' : 'sentence';

    const defaultIndex = activeTools.findIndex((item) => item.defaultFor === situation);
    return defaultIndex === -1 ? 0 : defaultIndex;
  };

  const createMenuEntry = (
    info: SelectInfo,
    parentId: number | null = null
  ): ContextMenuEntry | null => {
    const trimmedWords = info.words.trim();
    if (trimmedWords === '') {
      return null;
    }

    const tabIndex = resolveDefaultTabIndex(trimmedWords);
    if (tabIndex === null) {
      return null;
    }

    selectionCounterRef.current += 1;
    menuIdRef.current += 1;

    return {
      id: menuIdRef.current,
      parentId,
      selectionId: selectionCounterRef.current,
      tabIndex,
      ...info,
    };
  };

  const pushBaseMenu = (info: SelectInfo) => {
    const entry = createMenuEntry(info, null);
    if (!entry) {
      if (activeTools.length === 0) {
        alert('No enabled tools available. Enable one in Settings > Context Menu.');
      }
      setMenuStack([]);
      return;
    }

    setMenuStack([entry]);
  };

  const pushDrilldownMenu = (parentId: number, info: SelectInfo) => {
    const entry = createMenuEntry(info, parentId);
    if (!entry) {
      if (activeTools.length === 0) {
        alert('No enabled tools available. Enable one in Settings > Context Menu.');
        setMenuStack([]);
      }
      return;
    }

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
    setMenuStack((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, tabIndex } : entry))
    );
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
    onClick: onClickReaderView,
    onSelect: (selectedInfo: SelectInfo) => {
      pushBaseMenu(selectedInfo);
      setMenuVisible(false);
      setTocVisible(false);
    },
  });

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
      <ReaderHeader visible={menuVisible} onOpenToc={onToggleToc} />
      {menuStack.map((menu, index) => (
        <ContextMenuComponent
          key={menu.id}
          onChangeIndex={(tabIndex) => updateTabIndex(menu.id, tabIndex)}
          tabIndex={menu.tabIndex}
          words={menu.words}
          context={menu.context}
          selectionId={menu.selectionId}
          items={activeTools}
          api={contextMenuSettings.api}
          apiKey={contextMenuSettings.key}
          defaultModel={contextMenuSettings.defaultModel}
          isTopMost={index === menuStack.length - 1}
          onClose={() => removeMenuAndChildren(menu.id)}
          onDrilldownSelect={(info) => pushDrilldownMenu(menu.id, info)}
          zIndex={50 + index}
        />
      ))}
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
