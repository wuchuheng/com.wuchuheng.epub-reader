import React from 'react';
import { Book } from 'epubjs';
import { ReaderView } from './ReaderView';
import { TOCSidebar } from './TOCSidebar';
import { ReaderFooter } from './ReaderFooter';
import { useBookNavigation } from '../hooks/useBookNavigation';
import { useEpubReader } from '../hooks/useEpubReader';

/**
 * Reader instance interface combining book state with navigation methods
 */

interface ReaderContentProps {
  book: Book;
  // reader: ReaderInstance;
  // navigation: BookNavigationResult;
  isTocOpen: boolean;
  setIsTocOpen: (open: boolean) => void;
}

/**
 * Reader content component that manages the main reading area
 * Handles TOC sidebar and main reader view layout
 */
export const ReaderContent: React.FC<ReaderContentProps> = (props) => {
  const navigation = useBookNavigation(props.book);
  const { rendition, currentLocation, containerRef, error } = useEpubReader(props.book);

  return (
    <div className="flex-1 flex relative overflow-hidden">
      <TOCSidebar
        tableOfContents={navigation.tableOfContents}
        currentChapter={navigation.currentChapter}
        onChapterSelect={navigation.goToChapter}
        onToggle={() => props.setIsTocOpen(false)}
        isOpen={props.isTocOpen}
      />

      <div className="flex-1 flex flex-col">
        <ReaderView containerRef={containerRef} error={error} />
      </div>
    </div>
  );
};
