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
const EpubReaderRender: React.FC<EpubReaderRenderProps> = () => {
  const [menuVisible, setMenuVisible] = useState<boolean>(true);
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
    if (menuVisible) setMenuVisible(false);
    if (tocVisible) setTocVisible(false);
  };

  return (
    <div className="relative flex h-screen flex-col bg-white text-black">
      <ReaderHeader visible={menuVisible} onOpenToc={onToggleToc} />
      <TOCSidebar
        isOpen={tocVisible}
        currentChapter={null}
        onChapterSelect={function (href: string): void {
          throw new Error('Function not implemented.');
        }}
        onToggle={function (): void {
          setTocVisible(false);
        }}
        tableOfContents={[]}
      />

      {/* Toggle button to show menu when hidden */}
      <MenuButton visible={!menuVisible} setVisible={setMenuVisible} />

      <div className="relative h-full w-full bg-red-200" onClick={onClickReaderView} />

      <ReaderFooter visible={menuVisible} currentPage={2} totalPages={100} />
    </div>
  );
};
