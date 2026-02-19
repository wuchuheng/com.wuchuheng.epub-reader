import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BookMetadata, BookshelfState, UploadProgress } from '../../types/book';
import * as OPFSManager from '../../services/OPFSManager';

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

const combineChunks = (chunks: Uint8Array[], totalLength: number): Uint8Array => {
  const fileData = new Uint8Array(totalLength);
  let position = 0;
  chunks.forEach((chunk) => {
    fileData.set(chunk, position);
    position += chunk.length;
  });
  return fileData;
};

// --- NEW ASYNC THUNKS ---

export const loadBookshelf = createAsyncThunk('bookshelf/loadBookshelf', async (_, { rejectWithValue }) => {
  try {
    if (!OPFSManager.isSupported()) {
      throw new Error('OPFS is not supported in this browser');
    }
    await OPFSManager.initialize();

    // 1. Fetch local books and remote seed concurrently
    const [localBooks, seedResponse] = await Promise.all([
      OPFSManager.getAllBooks(),
      fetch('/seed.json'),
    ]);

    if (!seedResponse.ok) {
      throw new Error('Failed to fetch book seed.');
    }
    const seedData = await seedResponse.json();

    // 2. Reconcile and Merge
    const localHashes = new Set(localBooks.map((book) => book.hash).filter(Boolean));
    const placeholders: BookMetadata[] = [];

    for (const hash in seedData) {
      if (!localHashes.has(hash)) {
        const seedEntry = seedData[hash];
        placeholders.push({
          id: `placeholder-${hash}`,
          hash,
          name: seedEntry.title,
          fileName: seedEntry.fileName,
          remoteUrl: seedEntry.url,
          status: 'not-downloaded',
          isPreset: true,
          // Required fields, can be empty/default
          path: '',
          coverPath: '',
          createdAt: Date.now(),
        });
      }
    }
    
    // 3. Return merged list
    return [...localBooks, ...placeholders];
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Unknown error during bookshelf load');
  }
});

export const downloadPresetBook = createAsyncThunk(
  'bookshelf/downloadPresetBook',
  async (book: BookMetadata, { dispatch, rejectWithValue }) => {
    const tempId = book.id; // The placeholder ID
    try {
      if (!book.remoteUrl || !book.hash) {
        throw new Error('Invalid book data for download.');
      }

      const response = await fetch(book.remoteUrl);
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }

      const total = parseInt(response.headers.get('content-length') || '0', 10);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get response reader');

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
      const fileBuffer = OPFSManager.toArrayBuffer(fileData);
      const blob = new Blob([fileBuffer], { type: 'application/epub+zip' });
      const file = new File([blob], book.fileName || 'preset.epub', { type: 'application/epub+zip' });
      
      // Use the placeholder's hash for the upload
      const bookMetadata = await OPFSManager.uploadBookWithHash(file, book.hash, fileBuffer, {
        isPreset: true,
        remoteUrl: book.remoteUrl,
      });

      return { tempId, book: bookMetadata };
    } catch (error) {
      dispatch(updateBookError({ id: tempId, error: error instanceof Error ? error.message : 'Download failed' }));
      return rejectWithValue(error instanceof Error ? error.message : 'Download failed');
    }
  }
);


// --- PRE-EXISTING THUNKS (Upload, Delete) ---

export const uploadBook = createAsyncThunk('bookshelf/uploadBook', async (file: File, { rejectWithValue }) => {
  try {
    validateFile(file);
    const bookMetadata = await OPFSManager.uploadBook(file);
    return bookMetadata;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Upload failed');
  }
});

export const deleteBook = createAsyncThunk('bookshelf/deleteBook', async (bookId: string, { rejectWithValue }) => {
  try {
    if (!bookId) throw new Error('Invalid book ID');
    await OPFSManager.deleteBook(bookId);
    return bookId;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Delete failed');
  }
});

// --- SLICE DEFINITION ---

const initialState: BookshelfState = {
  books: [],
  isLoading: false,
  error: null,
  uploadProgress: null,
  isBookshelfInitialized: false,
  downloadingCount: 0,
};

const bookshelfSlice = createSlice({
  name: 'bookshelf',
  initialState,
  reducers: {
    updateDownloadProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const book = state.books.find((item) => item.id === action.payload.id);
      if (book) {
        book.status = 'downloading';
        book.downloadProgress = action.payload.progress;
      }
    },
    updateBookError: (state, action: PayloadAction<{ id: string; error: string }>) => {
      const book = state.books.find((item) => item.id === action.payload.id);
      if (book) {
        book.status = 'error';
        book.downloadError = action.payload.error;
      }
    },
    setUploadProgress: (state, action: PayloadAction<UploadProgress | null>) => {
      state.uploadProgress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Bookshelf
      .addCase(loadBookshelf.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadBookshelf.fulfilled, (state, action: PayloadAction<BookMetadata[]>) => {
        state.isLoading = false;
        state.isBookshelfInitialized = true;
        state.books = action.payload;
        state.downloadingCount = state.books.filter((b) => b.status === 'downloading').length;
      })
      .addCase(loadBookshelf.rejected, (state, action) => {
        state.isLoading = false;
        state.isBookshelfInitialized = true;
        state.error = action.payload as string;
      })

      // Download Preset Book
      .addCase(downloadPresetBook.pending, (state, action) => {
        const book = state.books.find((b) => b.id === action.meta.arg.id);
        if (book) {
          book.status = 'downloading';
          book.downloadProgress = 0;
          state.downloadingCount += 1;
        }
      })
      .addCase(downloadPresetBook.fulfilled, (state, action) => {
        const { tempId, book } = action.payload;
        const index = state.books.findIndex((b) => b.id === tempId);
        if (index !== -1) {
          state.books[index] = { ...book, status: 'local' };
        }
        state.downloadingCount = Math.max(0, state.downloadingCount - 1);
      })
      .addCase(downloadPresetBook.rejected, (state, action) => {
        const book = state.books.find((b) => b.id === action.meta.arg.id);
        if (book) {
          book.status = 'error';
          book.downloadError = action.payload as string;
        }
        state.downloadingCount = Math.max(0, state.downloadingCount - 1);
      })

      // Upload book
      .addCase(uploadBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadBook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books.push({ ...action.payload, status: 'local' });
      })
      .addCase(uploadBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete book
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.books = state.books.filter((book) => book.id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setUploadProgress, clearError, updateDownloadProgress, updateBookError } = bookshelfSlice.actions;

export default bookshelfSlice.reducer;
