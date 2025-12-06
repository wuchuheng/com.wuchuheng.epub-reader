import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCircleInfo, FaEllipsisVertical, FaRegTrashCan } from 'react-icons/fa6';
import { BookMetadata } from '../../types/book';
import { Modal } from '../Modal';
import { useBookDisplayData } from './hooks/useBookDisplayData';
import { BookCover } from './BookCover';
import { ProgressBar } from './ProgressBar';

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
  // 1. Input handling and derived state
  const { t } = useTranslation('homepage');
  const { displayName, displayAuthor, displayProgress, displaySize } = useBookDisplayData(book);
  const isDownloading = book.status === 'downloading';
  const isError = book.status === 'error';
  const isLocal = !isDownloading && !isError;
  const progressValue = isDownloading ? (book.downloadProgress ?? 0) : displayProgress;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // 2. Core processing - handlers and derived data
  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleCardClick = () => {
    if (!isLocal) {
      return;
    }

    setIsMenuOpen(false);
    onOpen(book.id);
  };

  const toggleMenu = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }

    const buttonRect = menuButtonRef.current?.getBoundingClientRect();
    if (buttonRect) {
      const menuWidth = 192;
      const menuHeight = 200;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const horizontalPadding = 8;
      const verticalPadding = 8;
      const left = Math.min(
        Math.max(buttonRect.right - menuWidth, horizontalPadding),
        viewportWidth - menuWidth - horizontalPadding
      );
      const top = Math.min(
        Math.max(buttonRect.bottom + verticalPadding, verticalPadding),
        viewportHeight - menuHeight - verticalPadding
      );

      setMenuPosition({ top, left });
    }

    setIsMenuOpen(true);
  };

  const handleDetailsOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDetailsOpen(true);
    setIsMenuOpen(false);
  };

  const handleDeleteModalOpen = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (isDownloading) {
      return;
    }

    setIsDeleteModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false);
    onDelete(book.id);
  };

  const detailItems = useMemo(() => {
    const chapterLabel =
      typeof book.chapterCount === 'number'
        ? t('bookshelf.chapters', { count: book.chapterCount })
        : t('bookshelf.detailsModal.unknown');
    const createdAtLabel =
      typeof book.createdAt === 'number'
        ? new Date(book.createdAt).toLocaleString()
        : t('bookshelf.detailsModal.unknown');

    return [
      { label: t('bookshelf.detailsModal.name'), value: displayName },
      { label: t('bookshelf.detailsModal.author'), value: displayAuthor },
      { label: t('bookshelf.detailsModal.chapters'), value: chapterLabel },
      { label: t('bookshelf.detailsModal.size'), value: displaySize },
      { label: t('bookshelf.detailsModal.createdAt'), value: createdAtLabel },
    ];
  }, [book.chapterCount, book.createdAt, displayAuthor, displayName, displaySize, t]);

  if (!book.id) {
    return null;
  }

  // 3. Output handling - render book card with menu and dialogs
  return (
    <>
      <div
        className="group relative cursor-pointer rounded-lg"
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
        <button
          type="button"
          ref={menuButtonRef}
          onClick={toggleMenu}
          className={
            'absolute right-2 top-2 rounded-full bg-gray-100 p-2 text-gray-700 ' +
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1' +
            'focus-visible:outline-blue-500'
          }
          aria-label={t('bookshelf.actions.openMenu')}
          style={{ zIndex: 1 }}
        >
          <FaEllipsisVertical className="h-4 w-4" />
        </button>

        {isMenuOpen ? (
          <div
            ref={menuRef}
            className={
              'fixed z-20 w-48 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg'
            }
            style={{ top: menuPosition.top, left: menuPosition.left }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="border-b px-3 py-2 text-sm font-semibold text-gray-900"
              title={displayName}
            >
              {displayName}
            </div>
            <button
              type="button"
              onClick={handleDetailsOpen}
              className={
                'flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors ' +
                'duration-150 hover:bg-gray-100'
              }
            >
              <FaCircleInfo className="h-4 w-4" />
              <span>{t('bookshelf.actions.details')}</span>
            </button>
            <button
              type="button"
              onClick={handleDeleteModalOpen}
              disabled={isDownloading}
              className={
                'flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors ' +
                'duration-150 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50'
              }
            >
              <FaRegTrashCan className="h-4 w-4" />
              <span>{t('bookshelf.actions.delete')}</span>
            </button>
          </div>
        ) : null}

        <div
          className={
            'overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-200 ' +
            'group-focus-within:shadow-lg group-hover:shadow-lg'
          }
        >
          <BookCover
            coverPath={book.coverPath}
            title={displayName}
            className="overflow-hidden rounded-t-lg"
          />

          <div className="p-2">
            <h3 className="mb-1 truncate text-lg font-semibold text-gray-900" title={displayName}>
              {displayName}
            </h3>
            <p className="mb-1 truncate text-sm text-gray-600" title={displayAuthor}>
              {displayAuthor}
            </p>
            <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
              <span>
                {typeof book.chapterCount === 'number'
                  ? t('bookshelf.chapters', { count: book.chapterCount })
                  : t('bookshelf.detailsModal.unknown')}
              </span>
              <span>{displaySize}</span>
            </div>

            {isDownloading && (
              <div className="mb-2 text-xs font-semibold text-blue-700">
                {t('bookshelf.downloading')}
              </div>
            )}
            {isError && (
              <div className="mb-2 text-xs font-semibold text-red-700">
                {book.downloadError || t('bookshelf.downloadFailed')}
              </div>
            )}

            <ProgressBar progress={progressValue} hideWhenZero={!isDownloading} />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        title={t('bookshelf.deleteModal.title')}
        onClose={() => setIsDeleteModalOpen(false)}
        closeLabel={t('common:close')}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className={
                'rounded border px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 ' +
                'hover:bg-gray-50 focus-visible:outline focus-visible:outline-2' +
                'focus-visible:outline-offset-1 focus-visible:outline-blue-500'
              }
            >
              {t('common:cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className={
                'rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ' +
                'hover:bg-red-700 focus-visible:outline focus-visible:outline-2' +
                'focus-visible:outline-offset-1 focus-visible:outline-blue-500'
              }
            >
              {t('bookshelf.deleteModal.confirm')}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-700">
          {t('bookshelf.deleteModal.message', { name: displayName })}
        </p>
      </Modal>

      <Modal
        isOpen={isDetailsOpen}
        title={t('bookshelf.detailsModal.title')}
        onClose={() => setIsDetailsOpen(false)}
        closeLabel={t('common:close')}
        footer={
          <button
            type="button"
            onClick={() => setIsDetailsOpen(false)}
            className={
              'rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ' +
              'hover:bg-blue-700 focus-visible:outline focus-visible:outline-2' +
              'focus-visible:outline-offset-1 focus-visible:outline-blue-500'
            }
          >
            {t('common:close')}
          </button>
        }
      >
        <dl className="space-y-3">
          {detailItems.map((item) => (
            <div className="flex justify-between gap-4 text-sm" key={item.label}>
              <dt className="text-gray-500">{item.label}</dt>
              <dd className="max-w-[60%] text-right text-gray-900">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Modal>
    </>
  );
};
