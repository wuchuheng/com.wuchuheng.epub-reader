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
    tabIndex: 0,
    words: 'hello',
    context:
      'Because they live up in heaven, and know how well God arranges everything for us, so that we need have no more fear or trouble and may be quite sure that all things will come right in the end. But then we must never forget to pray, and to ask God to remember us when He is arranging things, so that we too may feel safe and have no anxiety about what is going to happen.',
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
    onSelect: (selectedInfo: SelectInfo) => setContextMenu({ tabIndex: 0, ...selectedInfo }),
  });

  return (
    <div className="relative flex h-screen flex-col bg-white">
      <ReaderHeader visible={menuVisible} onOpenToc={onToggleToc} />
      <ContextMenuComponent
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
