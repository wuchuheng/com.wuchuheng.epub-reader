import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  initializeBookshelf,
  deleteBook,
  loadBooks,
  clearError,
} from '../../store/slices/bookshelfSlice';
import { BookCard } from '../../components/BookCard';
import { UploadZone } from '../../components/UploadZone';
import * as OPFSManager from '../../services/OPFSManager';

/**
 * Main bookshelf page component
 * Displays all books in a responsive grid layout
 * Handles book uploads, deletions, and navigation
 */
export const BookshelfPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { books, isLoading, error } = useAppSelector((state) => state.bookshelf);
  const [showUploadZone, setShowUploadZone] = useState(false);

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
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await dispatch(deleteBook(bookId)).unwrap();
      } catch (error) {
        alert(`Failed to delete book: ${error}`);
      }
    }
  };

  const handleUploadComplete = () => {
    setShowUploadZone(false);
    dispatch(loadBooks());
  };

  // 3. Output handling - render bookshelf
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Bookshelf</h1>
            <button
              onClick={() => setShowUploadZone(!showUploadZone)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              {showUploadZone ? 'Cancel' : 'Upload Book'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error state */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
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
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Browser compatibility warning */}
        {!OPFSManager.isSupported() && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Browser Not Supported</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This browser doesn't support the required file system features. Please use
                    Chrome 86+, Edge 86+, or Firefox 102+.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload zone */}
        {showUploadZone && (
          <div className="mb-8">
            <UploadZone onUploadComplete={handleUploadComplete} />
          </div>
        )}

        {/* Loading state */}
        {isLoading && books.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bookshelf...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && books.length === 0 && !showUploadZone && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No books yet</h2>
            <p className="text-gray-600 mb-4">
              Start building your digital library by uploading your first EPUB book.
            </p>
            <button
              onClick={() => setShowUploadZone(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Upload Your First Book
            </button>
          </div>
        )}

        {/* Books grid */}
        {!isLoading && books.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
