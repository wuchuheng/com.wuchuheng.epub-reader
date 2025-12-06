import { useTranslation } from 'react-i18next';
import { BookMetadata } from '../../../types/book';

/**
 * Hook to format and provide fallback values for book display data
 * @param book - The book metadata
 * @returns Formatted display values with fallbacks
 */
export function useBookDisplayData(book: BookMetadata) {
  const { t } = useTranslation('homepage');

  // 1. Input validation
  if (!book) {
    return {
      displayName: t('bookshelf.unknownTitle'),
      displayAuthor: t('bookshelf.unknownAuthor'),
      displayProgress: 0,
      displaySize: t('bookshelf.unknownSize'),
    };
  }

  // 2. Core processing - format display data with fallbacks
  const displayName = book.name || t('bookshelf.unknownTitle');
  const displayAuthor = book.author || t('bookshelf.unknownAuthor');
  const displayProgress =
    book.status === 'downloading' ? book.downloadProgress ?? 0 : book.progress || 0;
  const displaySize = book.size || t('bookshelf.unknownSize');

  // 3. Return formatted data
  return {
    displayName,
    displayAuthor,
    displayProgress,
    displaySize,
  };
}
