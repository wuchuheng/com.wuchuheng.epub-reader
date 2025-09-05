import { BookMetadata } from '../../../types/book';

/**
 * Hook to format and provide fallback values for book display data
 * @param book - The book metadata
 * @returns Formatted display values with fallbacks
 */
export function useBookDisplayData(book: BookMetadata) {
  // 1. Input validation
  if (!book) {
    return {
      displayName: 'Untitled Book',
      displayAuthor: 'Unknown Author',
      displayProgress: 0,
      displaySize: 'Unknown size',
    };
  }

  // 2. Core processing - format display data with fallbacks
  const displayName = book.name || 'Untitled Book';
  const displayAuthor = book.author || 'Unknown Author';
  const displayProgress = book.progress || 0;
  const displaySize = book.size || 'Unknown size';

  // 3. Return formatted data
  return {
    displayName,
    displayAuthor,
    displayProgress,
    displaySize,
  };
}
