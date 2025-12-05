import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReaderHeader } from './components/ReaderHeader';
import { ReaderHelpOverlay } from './components/ReaderHelpOverlay';
import { Book } from 'epubjs';
import { Loading } from './components/Loading';
import { getBookByBookId } from '../../services/EPUBMetadataService';
import { MenuButton } from './components/MenuButton';
import { ReaderFooter } from './components/ReaderFooter';
import { TOCSidebar } from './components/TOCSidebar';
import { InvalidBookError } from './components/ErrorRender';
import ContextMenuComponent from './components/ContextMenu';
import { NextPageButton, PrevPageButton } from './components/directory/NextPageButton';
import { useContextMenuSettings } from '../ContextMenuSettingsPage/hooks/useContextMenuSettings';
import { useContextMenuState } from './hooks/useContextMenuState';
import { useUrlSync } from './hooks/useUrlSync';
import { useReaderInteraction } from './hooks/useReaderInteraction';
import { useMessage } from '../../components/Message';

/**
 * Complete EPUB reader page component
 * Integrates all reader components into a cohesive reading experience
 * Follows the design specifications from DESIGN.md
 */
export const EpubReader: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation('reader');

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
        setError(t('invalidBook.loadError'));
      });
    return () => {
      isMounted = false;
    };
  }, [bookId, t]);

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

const EpubReaderRender: React.FC<EpubReaderRenderProps> = (props) => {
  // 1. State declarations
  const { settings: contextMenuSettings, updatePinnedMaximized } = useContextMenuSettings();
  const message = useMessage();
  const activeTools = useMemo(
    () => contextMenuSettings.items.filter((item) => item.enabled !== false),
    [contextMenuSettings.items]
  );

  // 2. Custom Hooks
  const {
    menuStack,
    isMenuOpenRef,
    setMenuStack,
    pushBaseMenu,
    pushDrilldownMenu,
    removeMenuAndChildren,
    updateTabIndex,
    getSupportedTools,
    restoreFromMetadata,
  } = useContextMenuState({
    activeTools,
    maxSelectedWords: contextMenuSettings.maxSelectedWords,
    onShowMessage: (msg) => message.warning(msg),
  });

  useUrlSync({
    menuStack,
    setMenuStack,
    restoreFromMetadata,
  });

  const {
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
  } = useReaderInteraction({
    book: props.book,
    menuStackLength: menuStack.length,
    isMenuOpenRef,
    onMenuClose: () => setMenuStack([]),
    onSelection: pushBaseMenu,
    maxSelectedWords: contextMenuSettings.maxSelectedWords,
    onShowMessage: (msg) => message.warning(msg),
  });

  // 3. Effects
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
  }, [activeTools.length, setMenuStack]);

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
            contextId={menu.id}
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
