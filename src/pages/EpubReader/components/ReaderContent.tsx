import React from 'react';
import { Book, Rendition } from 'epubjs';
import { ReaderView } from './ReaderView';
import { TOCSidebar } from './TOCSidebar';
import { ReaderFooter } from './ReaderFooter';
import { BookNavigationResult } from '../../../types/epub';

/**
 * Reader instance interface combining book state with navigation methods
 */
interface ReaderInstance {
  book: Book | null;
  rendition: Rendition | null;
  isLoading: boolean;
  error: string | null;
  currentLocation: string | null;
  goToChapter?: (href: string) => void;
}

interface ReaderContentProps {
  bookId: string;
  reader: ReaderInstance;
  navigation: BookNavigationResult;
  isTocOpen: boolean;
  setIsTocOpen: (open: boolean) => void;
}

/**
 * Reader content component that manages the main reading area
 * Handles TOC sidebar and main reader view layout
 */
export const ReaderContent: React.FC<ReaderContentProps> = ({
  bookId,
  reader,
  navigation,
  isTocOpen,
  setIsTocOpen,
}) => {
  const handleTocNavigate = (href: string) => {
    reader.goToChapter?.(href);
    setIsTocOpen(false);
  };

  return (
    <div className="flex-1 flex relative">
      <TOCSidebar
        tableOfContents={navigation.tableOfContents}
        currentChapter={navigation.currentChapter}
        onChapterSelect={handleTocNavigate}
        onToggle={() => setIsTocOpen(false)}
        isOpen={isTocOpen}
      />

      <div className="flex-1 flex flex-col">
        <ReaderView bookId={bookId} />
        <ReaderFooter reader={reader} navigation={navigation} />
      </div>
    </div>
  );
};
