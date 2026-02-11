import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BookMetadata, BookshelfState, PresetBookConfig, UploadProgress } from '../../types/book';
import * as OPFSManager from '../../services/OPFSManager';
import { DEFAULT_PRESET_BOOKS } from '../../config/config';
import type { RootState } from '..';

// 1. Input handling - validate parameters
const validateFile = (file: File): void => {
  if (!file || !file.name.toLowerCase().endsWith('.epub')) {
    throw new Error('Invalid EPUB file - must have .epub extension');
  }
  if (file.size === 0) {
    throw new Error('Invalid EPUB file - file is empty');
  }
  if (file.size > 100 * 1024 * 1024) {
    throw new Error('Invalid EPUB file - file size exceeds 100MB');
  }
};

const buildPresetPlaceholder = (preset: PresetBookConfig, tempId: string): BookMetadata => {
  const fileName = preset.url.split('/').pop() || 'Preset Book';
  const displayName = fileName.replace(/\.epub$/i, '') || fileName;

  return {
    id: tempId,
    name: displayName,
    author: 'Unknown Author',
    path: '',
    coverPath: '',
    createdAt: Date.now(),
    status: 'downloading',
    downloadProgress: 0,
    isPreset: true,
    remoteUrl: preset.url,
  };
};

const createPresetTempId = (): string =>
  `preset-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const combineChunks = (chunks: Uint8Array[], totalLength: number): Uint8Array => {
  const fileData = new Uint8Array(totalLength);
  let position = 0;

  chunks.forEach((chunk) => {
    fileData.set(chunk, position);
    position += chunk.length;
  });

  return fileData;
};

// Async thunks
export const initializeBookshelf = createAsyncThunk(
  'bookshelf/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // 1. Input handling - check OPFS support
      if (!OPFSManager.isSupported()) {
        throw new Error('OPFS is not supported in this browser');
      }

      // 2. Core processing - initialize and load books
      await OPFSManager.initialize();
      const books = await OPFSManager.getAllBooks();

      // 3. Output handling - return books
      return books;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const uploadBook = createAsyncThunk(
  'bookshelf/uploadBook',
  async (file: File, { rejectWithValue }) => {
    try {
      // 1. Input handling - validate file
      validateFile(file);

      // 2. Core processing - upload book
      const bookMetadata = await OPFSManager.uploadBook(file);

      // 3. Output handling - return new book
      return bookMetadata;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Upload failed');
    }
  }
);

export const deleteBook = createAsyncThunk(
  'bookshelf/deleteBook',
  async (bookId: string, { rejectWithValue }) => {
    try {
      // 1. Input handling - validate book ID
      if (!bookId) {
        throw new Error('Invalid book ID');
      }

      // 2. Core processing - delete book
      await OPFSManager.deleteBook(bookId);

      // 3. Output handling - return deleted book ID
      return bookId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Delete failed');
    }
  }
);

export const loadBooks = createAsyncThunk('bookshelf/loadBooks', async (_, { rejectWithValue }) => {
  try {
    // 2. Core processing - load all books
    const books = await OPFSManager.getAllBooks();

    // 3. Output handling - return books
    return books;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Load failed');
  }
});

export const downloadPresetBook = createAsyncThunk(
  'bookshelf/downloadPresetBook',
  async (
    { preset, existingId }: { preset: PresetBookConfig; existingId?: string },
    { dispatch, rejectWithValue }
  ) => {
    const tempId = existingId || createPresetTempId();

    try {
      if (!existingId) {
        dispatch(addPlaceholderBook(buildPresetPlaceholder(preset, tempId)));
      }

      const response = await fetch(preset.url);
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }

      const total = parseInt(response.headers.get('content-length') || '0', 10);
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;
      let lastProgressUpdate = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          chunks.push(value);
          receivedLength += value.length;
        }

        const now = Date.now();
        if (now - lastProgressUpdate > 100) {
          const progress = total > 0 ? Math.round((receivedLength / total) * 100) : 0;
          dispatch(updateDownloadProgress({ id: tempId, progress }));
          lastProgressUpdate = now;
        }
      }

      dispatch(updateDownloadProgress({ id: tempId, progress: 100 }));

      const fileData = combineChunks(chunks, receivedLength);
      const fileName = preset.url.split('/').pop() || 'preset.epub';
      const fileHash = await OPFSManager.calculateFileHash(fileData);
      const isDuplicate = await OPFSManager.checkFileHashExists(fileHash);

      if (isDuplicate) {
        await OPFSManager.updatePresetBookHash(preset.url, fileHash);
        dispatch(removePlaceholderBook(tempId));
        return { skipped: true, reason: 'duplicate', hash: fileHash };
      }

      const fileBuffer = OPFSManager.toArrayBuffer(fileData);
      const blob = new Blob([fileBuffer], { type: 'application/epub+zip' });
      const file = new File([blob], fileName, { type: 'application/epub+zip' });
      const bookMetadata = await OPFSManager.uploadBookWithHash(file, fileHash, fileBuffer, {
        isPreset: true,
        remoteUrl: preset.url,
      });

      await OPFSManager.updatePresetBookHash(preset.url, fileHash);

      dispatch(
        replacePlaceholderBook({
          tempId,
          book: { ...bookMetadata, isPreset: true, remoteUrl: preset.url },
        })
      );

      return { skipped: false, book: bookMetadata };
    } catch (error) {
      dispatch(
        updateBookError({
          id: tempId,
          error: error instanceof Error ? error.message : 'Download failed',
        })
      );
      return rejectWithValue(error instanceof Error ? error.message : 'Download failed');
    }
  }
);

export const initializePresetBooks = createAsyncThunk(
  'bookshelf/initializePresetBooks',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const config = await OPFSManager.loadConfig();

      const remoteUrls = new Set(DEFAULT_PRESET_BOOKS.map((preset) => preset.url));
      const localPresets = config.presetBooks ?? [];
      const syncedPresets = localPresets.map((preset) => {
        if (!remoteUrls.has(preset.url) && !preset.deletedAt) {
          return { ...preset, deletedAt: Date.now() };
        }
        return preset;
      });

      const localUrlMap = new Map(localPresets.map((preset) => [preset.url, preset]));
      DEFAULT_PRESET_BOOKS.forEach((preset) => {
        if (!localUrlMap.has(preset.url)) {
          syncedPresets.push({ url: preset.url });
        }
      });

      if (
        !config.presetBooks ||
        JSON.stringify(config.presetBooks) !== JSON.stringify(syncedPresets)
      ) {
        config.presetBooks = syncedPresets;
        await OPFSManager.saveConfig(config);
      }

      const booksToDownload = syncedPresets.filter(
        (preset) => !preset.fileHash && !preset.deletedAt
      );

      if (booksToDownload.length === 0) {
        return { skipped: true, reason: 'all_books_downloaded' };
      }

      const state = getState() as RootState;
      const hasActiveDownload = state.bookshelf.books.some(
        (book) => book.isPreset && book.status === 'downloading'
      );

      if (hasActiveDownload) {
        return { skipped: true, reason: 'download_in_progress' };
      }

      // 1. Batch create placeholders
      const placeholders = booksToDownload.map((preset) => {
        const tempId = createPresetTempId();
        return { preset, tempId, placeholder: buildPresetPlaceholder(preset, tempId) };
      });

      dispatch(addPlaceholderBooks(placeholders.map((p) => p.placeholder)));

      // 2. Trigger downloads
      placeholders.forEach(({ preset, tempId }) => {
        dispatch(downloadPresetBook({ preset, existingId: tempId }));
      });

      return { skipped: false, downloadCount: booksToDownload.length };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to initialize preset books'
      );
    }
  }
);

// Initial state
const initialState: BookshelfState = {
  books: [],
  isLoading: false,
  error: null,
  uploadProgress: null,
  presetBooksInitialized: false,
  isInitializingPresets: false,
  downloadingCount: 0,
};

// Slice
const bookshelfSlice = createSlice({
  name: 'bookshelf',
  initialState,
  reducers: {
    addPlaceholderBook: (state, action: PayloadAction<BookMetadata>) => {
      const placeholder = {
        ...action.payload,
        status: 'downloading' as const,
        downloadProgress: action.payload.downloadProgress ?? 0,
      };
      state.books.push(placeholder);
      state.downloadingCount += 1;
    },
    addPlaceholderBooks: (state, action: PayloadAction<BookMetadata[]>) => {
      const placeholders = action.payload.map((book) => ({
        ...book,
        status: 'downloading' as const,
        downloadProgress: book.downloadProgress ?? 0,
      }));
      state.books.push(...placeholders);
      state.downloadingCount += placeholders.length;
    },
    removePlaceholderBook: (state, action: PayloadAction<string>) => {
      state.books = state.books.filter((book) => book.id !== action.payload);
      state.downloadingCount = Math.max(0, state.downloadingCount - 1);
    },
    replacePlaceholderBook: (
      state,
      action: PayloadAction<{ tempId: string; book: BookMetadata }>
    ) => {
      const index = state.books.findIndex((book) => book.id === action.payload.tempId);
      if (index !== -1) {
        state.books[index] = { ...action.payload.book, status: 'local' };
        state.downloadingCount = Math.max(0, state.downloadingCount - 1);
      }
    },
    updateDownloadProgress: (
      state,
      action: PayloadAction<{ id: string; progress: number }>
    ) => {
      const book = state.books.find((item) => item.id === action.payload.id);
      if (book) {
        book.downloadProgress = action.payload.progress;
        book.status = 'downloading';
      }
    },
    updateBookError: (state, action: PayloadAction<{ id: string; error: string }>) => {
      const book = state.books.find((item) => item.id === action.payload.id);
      if (book) {
        book.status = 'error';
        book.downloadError = action.payload.error;
      }
      state.downloadingCount = Math.max(0, state.downloadingCount - 1);
    },
    // 3. Output handling - update upload progress
    setUploadProgress: (state, action: PayloadAction<UploadProgress | null>) => {
      state.uploadProgress = action.payload;
    },
    // 3. Output handling - clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize bookshelf
      .addCase(initializeBookshelf.pending, (state) => {
        // 1. Input handling - set loading state
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeBookshelf.fulfilled, (state, action) => {
        // 3. Output handling - update books
        state.isLoading = false;
        state.books = action.payload.map((book) => ({ ...book, status: book.status ?? 'local' }));
        state.downloadingCount = state.books.filter((book) => book.status === 'downloading').length;
      })
      .addCase(initializeBookshelf.rejected, (state, action) => {
        // 3. Output handling - handle error
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Upload book
      .addCase(uploadBook.pending, (state) => {
        // 1. Input handling - set loading state
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadBook.fulfilled, (state, action) => {
        // 3. Output handling - add new book
        state.isLoading = false;
        state.books.push({ ...action.payload, status: 'local' });
      })
      .addCase(uploadBook.rejected, (state, action) => {
        // 3. Output handling - handle error
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete book
      .addCase(deleteBook.pending, (state) => {
        // 1. Input handling - set loading state
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        // 3. Output handling - remove book
        state.isLoading = false;
        state.books = state.books.filter((book) => book.id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        // 3. Output handling - handle error
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Load books
      .addCase(loadBooks.pending, (state) => {
        // 1. Input handling - set loading state
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadBooks.fulfilled, (state, action) => {
        // 3. Output handling - update books
        state.isLoading = false;
        state.books = action.payload;
        state.downloadingCount = state.books.filter((book) => book.status === 'downloading').length;
      })
      .addCase(loadBooks.rejected, (state, action) => {
        // 3. Output handling - handle error
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(downloadPresetBook.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(initializePresetBooks.pending, (state) => {
        state.isInitializingPresets = true;
      })
      .addCase(initializePresetBooks.fulfilled, (state) => {
        state.presetBooksInitialized = true;
        state.isInitializingPresets = false;
      })
      .addCase(initializePresetBooks.rejected, (state, action) => {
        state.presetBooksInitialized = true;
        state.isInitializingPresets = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setUploadProgress,
  clearError,
  addPlaceholderBook,
  addPlaceholderBooks,
  removePlaceholderBook,
  replacePlaceholderBook,
  updateDownloadProgress,
  updateBookError,
} = bookshelfSlice.actions;

// Export reducer
export default bookshelfSlice.reducer;
