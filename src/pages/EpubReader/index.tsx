import React, { useEffect, useState } from 'react';
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
import { ContextMenu, SelectInfo } from '../../types/epub';
import ContextMenuComponent from './components/ContextMenu';
import { NextPageButton, PrevPageButton } from './components/directory/NextPageButton';

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
    getBookByBookId(bookId)
      .then(setBook)
      .catch((err) => {
        console.error('Failed to load book:', err);
        setError('Failed to load book. Please try again later.');
      });
    return () => {
      book?.destroy();
      setBook(null);
    };
  }, [bookId]);

  if (!bookId || error) return <InvalidBookError error={error} />;
  if (!book) return <Loading />;

  return <EpubReaderRender book={book!} />;
};

type EpubReaderRenderProps = {
  book: Book;
};
const EpubReaderRender: React.FC<EpubReaderRenderProps> = (props) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [tocVisible, setTocVisible] = useState(false);
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

  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    tabIndex: null,
    words: '',
    context: '',
  });

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
      setContextMenu({ tabIndex: 0, ...selectedInfo });
      setMenuVisible(false);
      setTocVisible(false);
    },
  });

  const handleChangeMenuIndex = (index: number) => {
    setContextMenu((prev) => ({ ...prev, tabIndex: index }));

    // 2.2 Hide the menu and table of contents if that is visible.
  };

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

  useEffect(() => {
    function onVolumeButtonsListener(info) {
      console.log('Button pressed: ' + info.signal);
      onNext();
    }
    window.addEventListener('volumebuttonslistener', onVolumeButtonsListener, false);
  }, []);

  return (
    <div className="relative flex h-screen flex-col bg-white">
      <ReaderHeader visible={menuVisible} onOpenToc={onToggleToc} />
      <ContextMenuComponent
        onChangeIndex={handleChangeMenuIndex}
        tabIndex={contextMenu.tabIndex}
        words={contextMenu.words}
        context={contextMenu.context}
        onClose={function (): void {
          setContextMenu((prev) => ({ ...prev, tabIndex: null }));
        }}
      />
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
