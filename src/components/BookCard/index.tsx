import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookMetadata } from '../../types/book';
import { useBookDisplayData } from './hooks/useBookDisplayData';
import { BookCover } from './BookCover';
import { ProgressBar } from './ProgressBar';
import { BookActions } from './BookActions';

interface BookCardProps {
  /** Book metadata to display */
  book: BookMetadata;
  /** Callback when book is clicked */
  onOpen: (bookId: string) => void;
  /** Callback when delete is clicked */
  onDelete: (bookId: string) => void;
}

/**
 * Component for displaying a single book in the bookshelf
 * Shows book cover, title, author, and basic actions
 * Refactored to use extracted components for better maintainability
 */
export const BookCard: React.FC<BookCardProps> = ({ book, onOpen, onDelete }) => {
  // 1. Input validation and core processing
  const { t } = useTranslation('homepage');
  const { displayName, displayAuthor, displayProgress, displaySize } = useBookDisplayData(book);

  // 2. Early return for invalid book data
  if (!book || !book.id) {
    return null;
  }

  // 3. Prepare event handlers
  const handleCardClick = () => {
    onOpen(book.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(book.id);
  };

  const handleReadClick = () => {
    onOpen(book.id);
  };

  // 4. Output handling - render book card with extracted components
  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-200 hover:shadow-lg"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={t('bookshelf.openBookAria', { name: displayName })}
    >
      {/* Book cover */}
      <BookCover coverPath={book.coverPath} title={displayName} />

      {/* Book info */}
      <div className="p-4">
        <h3 className="mb-1 truncate text-lg font-semibold text-gray-900" title={displayName}>
          {displayName}
        </h3>
        <p className="mb-2 truncate text-sm text-gray-600" title={displayAuthor}>
          {displayAuthor}
        </p>

        {/* Progress bar */}
        <ProgressBar progress={displayProgress} />

        {/* Book details */}
        <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
          <span>{displaySize}</span>
          {book.chapterCount ? (
            <span>{t('bookshelf.chapters', { count: book.chapterCount })}</span>
          ) : null}
        </div>

        {/* Action buttons */}
        <BookActions onRead={handleReadClick} onDelete={handleDeleteClick} />
      </div>
    </div>
  );
};
