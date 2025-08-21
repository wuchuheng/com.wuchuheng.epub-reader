import React, { useEffect, useState } from 'react';
import { BookMetadata } from '../../types/book';
import { getCoverBase64ByPath } from '../../services/OPFSManager';

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
 */
export const BookCard: React.FC<BookCardProps> = ({ book, onOpen, onDelete }) => {
  const [coverPath, setCoverPath] = useState<string | undefined>();

  useEffect(() => {
    getCoverBase64ByPath(book.coverPath).then((base64Str) => {
      setCoverPath(base64Str);
    });
  }, [book.coverPath]);

  // 2. Core processing - format display data
  const displayName = book.name || 'Untitled Book';
  const displayAuthor = book.author || 'Unknown Author';
  const displayProgress = book.progress || 0;
  const displaySize = book.size || 'Unknown size';

  if (!book || !book.id) {
    return null;
  }

  // 3. Output handling - render book card
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Book cover */}
      <div className="aspect-[3/4] bg-gray-200 relative">
        {coverPath ? (
          <img
            src={coverPath}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if cover fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <div className="text-center p-4">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-sm text-gray-600 font-medium">{displayName}</div>
            </div>
          </div>
        )}
      </div>

      {/* Book info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate" title={displayName}>
          {displayName}
        </h3>
        <p className="text-sm text-gray-600 mb-2 truncate" title={displayAuthor}>
          {displayAuthor}
        </p>

        {/* Progress bar */}
        {displayProgress > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{displayProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Book details */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
          <span>{displaySize}</span>
          {book.chapterCount && <span>{book.chapterCount} chapters</span>}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onOpen(book.id)}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Read
          </button>
          <button
            onClick={() => onDelete(book.id)}
            className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors duration-200"
            title="Delete book"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};
