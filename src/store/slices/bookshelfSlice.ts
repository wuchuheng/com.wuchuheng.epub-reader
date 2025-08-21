import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BookshelfState, UploadProgress } from '../../types/book';
import { OPFSManager } from '../../services/OPFSManager';

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
      const opfs = OPFSManager.getInstance();
      await opfs.initialize();
      const books = await opfs.getAllBooks();

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
      const opfs = OPFSManager.getInstance();
      const bookMetadata = await opfs.uploadBook(file);

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
      const opfs = OPFSManager.getInstance();
      await opfs.deleteBook(bookId);

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
    const opfs = OPFSManager.getInstance();
    const books = await opfs.getAllBooks();

    // 3. Output handling - return books
    return books;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Load failed');
  }
});

// Initial state
const initialState: BookshelfState = {
  books: [],
  isLoading: false,
  error: null,
  uploadProgress: null,
};

// Slice
const bookshelfSlice = createSlice({
  name: 'bookshelf',
  initialState,
  reducers: {
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
        state.books = action.payload;
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
        state.books.push(action.payload);
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
      })
      .addCase(loadBooks.rejected, (state, action) => {
        // 3. Output handling - handle error
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { setUploadProgress, clearError } = bookshelfSlice.actions;

// Export reducer
export default bookshelfSlice.reducer;
