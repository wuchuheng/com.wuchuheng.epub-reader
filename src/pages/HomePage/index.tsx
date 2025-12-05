import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  initializeBookshelf,
  deleteBook,
  loadBooks,
  clearError,
  uploadBook,
} from '../../store/slices/bookshelfSlice';
import { BookCard } from '../../components/BookCard';
import * as OPFSManager from '../../services/OPFSManager';
import { DragOverlay } from './components/DragOverlay';
import { getEpubValidationError, isValidEpubFile } from '../../utils/epubValidation';
import { Plus, Settings } from '../../components/icons';
import { MdInstallDesktop } from 'react-icons/md';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import LanguageSwitcher from '../../components/LanguageSwitcher';

/**
 * Main bookshelf page component
 * Displays all books in a responsive grid layout
 * Handles book uploads via drag-and-drop or file picker, deletions, and navigation
 */
export const BookshelfPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation('homepage');
  const { books, isLoading, error } = useAppSelector((state) => state.bookshelf);
  const { isInstalled, installPWA, canInstall } = usePWAInstall();

  console.log('BookshelfPage: PWA State - isInstalled:', isInstalled, 'canInstall:', canInstall);

  // Manual PWA install trigger for testing
  const handleManualInstallTest = () => {
    console.log('Manual PWA install test triggered');
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      console.log('Service Worker is active');
      // Force show install prompt for testing
      window.dispatchEvent(new Event('beforeinstallprompt'));
    } else {
      console.log('Service Worker not active or not found');
    }
  };

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // 1. Input handling - initialize bookshelf on mount
  useEffect(() => {
    const initBookshelf = async () => {
      try {
        await dispatch(initializeBookshelf()).unwrap();
      } catch (error) {
        // Browser doesn't support OPFS, show error
        console.error('Failed to initialize bookshelf:', error);
      }
    };

    initBookshelf();
  }, [dispatch]);

  // 2. Core processing - handle book actions
  const handleOpenBook = (bookId: string) => {
    navigate(`/reader/${bookId}`);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm(t('alerts.deleteConfirm'))) {
      try {
        await dispatch(deleteBook(bookId)).unwrap();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        alert(t('alerts.deleteFailed', { error: message }));
      }
    }
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      // 1. Input handling
      const validationError = getEpubValidationError(file);

      if (validationError) {
        alert(validationError);
        return;
      }

      // 2. Core processing
      try {
        await dispatch(uploadBook(file)).unwrap();
        dispatch(loadBooks());
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        alert(t('alerts.uploadFailed', { error: message }));
      }
    },
    [dispatch, t]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    // 1. Input handling
    e.preventDefault();
    e.stopPropagation();

    // 2. Core processing
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // 1. Input handling
    e.preventDefault();
    e.stopPropagation();

    // 2. Core processing
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    // 1. Input handling
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      // 1. Input handling
      e.preventDefault();
      e.stopPropagation();

      // 2. Core processing
      setIsDragging(false);
      dragCounter.current = 0;

      const files = Array.from(e.dataTransfer.files);
      const epubFile = files.find((file) => isValidEpubFile(file));

      if (epubFile) {
        handleFileUpload(epubFile);
      } else if (files.length > 0) {
        alert(t('alerts.invalidFile'));
      }
    },
    [handleFileUpload, t]
  );

  const handleUploadBtnClick = () => {
    // 2. Core processing
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Input handling
    const file = e.target.files?.[0];

    // 2. Core processing
    if (file) {
      handleFileUpload(file);
    }

    // 3. Output handling
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 3. Output handling - render bookshelf
  return (
    <div
      className="min-h-screen bg-gray-50"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DragOverlay isVisible={isDragging} />
      <input
        type="file"
        accept=".epub,application/epub+zip"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileInputChange}
      />

      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl p-2 sm:px-2 lg:px-4">
          <div className="flex items-center justify-between">
            <p>
              <h1 className="sm:text-1xl font-bold text-gray-900">{t('appTitle')}</h1>
              <span className="text-sm text-gray-600">{t('slogan.title')}</span>
            </p>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {!isInstalled && canInstall && (
                <button
                  onClick={installPWA}
                  className="text-gray-600 hover:text-gray-900"
                  aria-label={t('header.installApp')}
                  title={t('header.installTitle')}
                >
                  <MdInstallDesktop />
                </button>
              )}
              <button
                onClick={() => navigate('/settings')}
                className="text-gray-600 hover:text-gray-900"
                aria-label={t('header.settings')}
                title={t('header.settings')}
              >
                <Settings />
              </button>
              <button
                onClick={handleUploadBtnClick}
                className="text-gray-600 hover:text-gray-900"
                aria-label={t('header.uploadBook')}
                title={t('header.uploadBook')}
              >
                <Plus />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-2 py-2 sm:px-6 lg:px-8">
        {/* Error state */}
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{t('errorHeading')}</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => dispatch(clearError())}
                className="text-sm text-red-600 hover:text-red-500"
              >
                {t('common:dismiss')}
              </button>
            </div>
          </div>
        )}
        {/* Browser compatibility warning */}
        {!OPFSManager.isSupported() && (
          <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">{t('browserWarning.title')}</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{t('browserWarning.description')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && books.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">{t('loadingBookshelf')}</p>
          </div>
        )}
        {/* Empty state */}
        {!isLoading && books.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl">📚</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">{t('emptyState.title')}</h2>
            <p className="mb-4 text-gray-600">{t('emptyState.description')}</p>
            <button
              onClick={handleUploadBtnClick}
              className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
            >
              {t('emptyState.uploadButton')}
            </button>
          </div>
        )}
        {/* Books grid */}
        {!isLoading && books.length > 0 && (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onOpen={handleOpenBook}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Default export for router
export default BookshelfPage;
