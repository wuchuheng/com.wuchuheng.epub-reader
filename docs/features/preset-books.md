# Preset Books Feature Specification

**Version**: 2.0  
**Last Updated**: 2025-12-06  
**Status**: Ready for Implementation

---

## Overview

Automatically download and display pre-configured EPUB books from remote server. Books stored using SHA-256 hashing for automatic deduplication.

### Core Requirements

- ✅ Check for missing preset books **every app open** (not just first time)
- ✅ Downloads run in **Redux thunks** (persist across route changes)
- ✅ **Hot reload support**: Sync with remote config using `deletedAt` field
- ✅ Hash-based storage (SHA-256) instead of UUID
- ✅ O(1) duplicate detection via `hashMapFilePath` index
- ✅ Display download progress in real-time

### Key Design Decisions

1. **Minimal Config** - Only store `url`, `fileHash`, `deletedAt` (no metadata)
2. **Background Downloads** - Redux thunks continue downloads across routes
3. **Hot Reload** - `deletedAt` marks removed books, filtered during sync
4. **Content-Based Dedup** - Hash-based storage prevents duplicate uploads

---

## Data Structures

### PresetBookConfig

```typescript
interface PresetBookConfig {
  url: string; // Remote URL (e.g., /books/Heidi.epub)
  fileHash?: string; // SHA-256 hash (set after download completes)
  deletedAt?: number; // Timestamp when book was deleted (for hot reload)
}
```

- `url`: Required, source of the EPUB file
- `fileHash`: Set after successful download, marks completion
- `deletedAt`: Marks removed books during hot reload sync

### OPFSConfig Extensions

```typescript
interface OPFSConfig {
  version: 1;
  books: BookMetadata[];
  settings: AppSettings;
  lastSync: number;

  // NEW FIELDS
  hashMapFilePath: Record<string, string>; // hash -> file path (O(1) lookup)
  presetBooks?: PresetBookConfig[]; // preset book tracking
}
```

### BookMetadata Extensions

```typescript
interface BookMetadata {
  id: string; // SHA-256 hash (not UUID anymore)
  name: string;
  path: string;
  author?: string;
  coverPath: string;
  createdAt: number;

  // NEW FIELDS for preset books
  status?: 'local' | 'downloading' | 'error';
  downloadProgress?: number; // 0-100
  isPreset?: boolean;
  remoteUrl?: string; // For retry
}
```

### Default Configuration

```typescript
// src/constants/epub.ts
export const DEFAULT_PRESET_BOOKS: PresetBookConfig[] = [
  { url: '/books/Heidi.epub' },
  { url: '/books/Alice.epub' },
  { url: '/books/TomSawyer.epub' },
];
```

---

## Architecture

### Background Downloads

**Problem**: Downloads must persist across route navigation.

**Solution**: Use Redux thunks (global state), not React components.

```
┌─────────────────────────────────┐
│   Redux Store (Global State)   │
│   books: [{                     │
│     id: "temp-123",             │
│     status: "downloading",      │
│     downloadProgress: 45        │
│   }]                            │
└─────────────────────────────────┘
         │              │
    ┌────┴───┐    ┌────┴─────┐
    │HomePage│    │Settings  │
    │(shows  │    │(downloads│
    │progress)    │continue) │
    └────────┘    └──────────┘
```

**Key Points**:

- Downloads start in `main.tsx` via `initializePresetBooks()`
- Continue running even if user navigates away
- Check every app open (resumes incomplete, detects new books)
- Hot reload: sync with remote, mark deleted books with `deletedAt`

### File Storage Migration

**Change**: UUID → SHA-256 hash-based directories

```
Before: books/<uuid>/book.epub
After:  books/<sha256-hash>/book.epub
```

**Benefits**: Automatic deduplication, content verification, consistent IDs

---

## Key Workflows

### 1. First-Time User + Hot Reload Sync

```
1. App starts
   ↓
2. Load config.json (or create default)
   ↓
3. initializePresetBooks() runs
   ↓
4. Sync remote DEFAULT_PRESET_BOOKS with local config.presetBooks:
   - Mark deleted books (exist in local but not remote): set deletedAt
   - Add new books from remote
   ↓
5. Filter books to download:
   - No fileHash (not downloaded)
   - No deletedAt (not deleted)
   ↓
6. For each book:
   - Download file
   - Compute SHA-256 hash
   - Check hashMapFilePath[hash] (O(1))
   - If duplicate → skip
   - If new → save to OPFS, update config
```

### 2. Manual Upload (Duplicate Detection)

```
1. User uploads EPUB file
   ↓
2. Compute SHA-256 hash
   ↓
3. Check hashMapFilePath[hash]
   ↓
4. If exists → reject ("Book already exists")
   ↓
5. If new → save to books/<hash>/, update index
```

---

## Implementation Guide

### 1. App Initialization (main.tsx)

```typescript
// src/main.tsx
import { initializeBookshelf, initializePresetBooks } from './store/slices/bookshelfSlice';

const initializeApp = async () => {
  try {
    // Load existing books
    await store.dispatch(initializeBookshelf()).unwrap();

    // Check and download preset books (runs in background)
    store.dispatch(initializePresetBooks());
    // Don't await - downloads continue in Redux
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

initializeApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
});
```

### 2. Redux Thunk: initializePresetBooks

```typescript
export const initializePresetBooks = createAsyncThunk(
  'bookshelf/initializePresetBooks',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const config = await OPFSManager.loadConfig();

      // HOT RELOAD SYNC
      const remoteUrls = new Set(DEFAULT_PRESET_BOOKS.map((p) => p.url));
      const localPresets = config.presetBooks || [];

      // Mark deleted books
      const syncedPresets = localPresets.map((preset) => {
        if (!remoteUrls.has(preset.url) && !preset.deletedAt) {
          return { ...preset, deletedAt: Date.now() };
        }
        return preset;
      });

      // Add new books from remote
      const localUrlsMap = new Map(localPresets.map((p) => [p.url, p]));
      for (const remotePreset of DEFAULT_PRESET_BOOKS) {
        if (!localUrlsMap.has(remotePreset.url)) {
          syncedPresets.push({ url: remotePreset.url });
        }
      }

      // Save synced config
      if (JSON.stringify(config.presetBooks) !== JSON.stringify(syncedPresets)) {
        config.presetBooks = syncedPresets;
        await OPFSManager.saveConfig(config);
      }

      // Filter books to download (no fileHash, no deletedAt)
      const booksToDownload = syncedPresets.filter(
        (preset) => !preset.fileHash && !preset.deletedAt
      );

      if (booksToDownload.length === 0) {
        return { skipped: true, reason: 'all_books_downloaded' };
      }

      // Prevent duplicate downloads
      const state = getState() as RootState;
      const alreadyDownloading = state.bookshelf.books.some(
        (b) => b.isPreset && b.status === 'downloading'
      );

      if (alreadyDownloading) {
        return { skipped: true, reason: 'download_in_progress' };
      }

      // Start downloads (run in Redux, persist across routes)
      for (const preset of booksToDownload) {
        dispatch(downloadPresetBook(preset));
      }

      return { skipped: false, downloadCount: booksToDownload.length };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to initialize preset books'
      );
    }
  }
);
```

### 3. Redux Thunk: downloadPresetBook

```typescript
export const downloadPresetBook = createAsyncThunk(
  'bookshelf/downloadPresetBook',
  async (preset: PresetBookConfig, { dispatch, rejectWithValue }) => {
    const tempId = `preset-${Date.now()}-${Math.random()}`;

    try {
      const fileName = preset.url.split('/').pop() || 'Unknown Book';
      const displayName = fileName.replace(/\.epub$/i, '');

      // Add placeholder to Redux state
      dispatch(
        addPlaceholderBook({
          id: tempId,
          name: displayName,
          status: 'downloading',
          downloadProgress: 0,
          isPreset: true,
          remoteUrl: preset.url,
        })
      );

      // Download with progress tracking
      const response = await fetch(preset.url);
      if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

      const total = parseInt(response.headers.get('content-length') || '0', 10);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get response reader');

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;
      let lastProgressUpdate = 0;

      // Read stream in chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        // Throttled progress updates (every 100ms)
        const now = Date.now();
        if (now - lastProgressUpdate > 100) {
          const progress = total > 0 ? Math.round((receivedLength / total) * 100) : 0;
          dispatch(updateDownloadProgress({ id: tempId, progress }));
          lastProgressUpdate = now;
        }
      }

      dispatch(updateDownloadProgress({ id: tempId, progress: 100 }));

      // Combine chunks
      const fileData = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        fileData.set(chunk, position);
        position += chunk.length;
      }

      // Compute hash
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileData);
      const fileHash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // Check for duplicates
      const isDuplicate = await OPFSManager.checkFileHashExists(fileHash);

      if (isDuplicate) {
        // Just mark as downloaded, don't save again
        await OPFSManager.updatePresetBookHash(preset.url, fileHash);
        dispatch(removePlaceholderBook(tempId));
        return { skipped: true, reason: 'duplicate', hash: fileHash };
      }

      // Save to OPFS
      const blob = new Blob([fileData], { type: 'application/epub+zip' });
      const file = new File([blob], fileName, { type: 'application/epub+zip' });
      const bookMetadata = await OPFSManager.uploadBookWithHash(file, fileHash);

      // Update config
      await OPFSManager.updatePresetBookHash(preset.url, fileHash);

      // Replace placeholder with final book
      dispatch(replacePlaceholderBook({ tempId, book: bookMetadata }));

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
```

### 4. OPFSManager Functions

```typescript
// Check if hash exists (O(1))
export async function checkFileHashExists(hash: string): Promise<boolean> {
  const config = await loadConfig();
  return hash in config.hashMapFilePath;
}

// Update preset book hash after download
export async function updatePresetBookHash(url: string, fileHash: string): Promise<void> {
  const config = await loadConfig();

  if (!config.presetBooks) config.presetBooks = [];

  const preset = config.presetBooks.find((p) => p.url === url);
  if (preset) {
    preset.fileHash = fileHash;
  } else {
    config.presetBooks.push({ url, fileHash });
  }

  config.lastSync = Date.now();
  await saveConfig(config);
}

// Upload book with hash-based storage
export async function uploadBookWithHash(file: File, fileHash: string): Promise<BookMetadata> {
  const directoryStructure = await getDirectoryStructure();

  // Validation
  const validationError = getEpubValidationError(file);
  if (validationError) throw new Error(validationError);

  const bookId = fileHash; // Use hash as ID
  const bookDirName = bookId;
  const bookPath = `books/${bookDirName}/${file.name}`;

  return await performFileOperation<BookMetadata>(async () => {
    // Create directory
    const bookDir = await directoryStructure.booksDir.getDirectoryHandle(bookDirName, {
      create: true,
    });

    // Save EPUB file
    const bookFileHandle = await bookDir.getFileHandle(file.name, { create: true });
    const writable = await bookFileHandle.createWritable();
    await writable.write(await file.arrayBuffer());
    await writable.close();

    // Extract metadata
    const book = ePub(await file.arrayBuffer());
    const epubMetadata = await EPUBMetadataService.extractMetadata(file);

    // Extract cover
    let coverPath = '';
    try {
      const coverBlob = await EPUBMetadataService.extractCoverBlob(book);
      const coverFormat = (await EPUBMetadataService.getCoverFormat(book)) || 'jpg';

      if (coverBlob) {
        const coverFileName = `cover.${coverFormat}`;
        const coverFileHandle = await bookDir.getFileHandle(coverFileName, { create: true });
        const coverWritable = await coverFileHandle.createWritable();
        await coverWritable.write(await coverBlob.arrayBuffer());
        await coverWritable.close();
        coverPath = `books/${bookDirName}/${coverFileName}`;
      }
    } catch (error) {
      console.warn('Failed to extract cover:', error);
    }

    // Create metadata
    const bookMetadata: BookMetadata = {
      id: bookId,
      name: epubMetadata.title || file.name.replace(/\.epub$/i, ''),
      author: epubMetadata.author || 'Unknown Author',
      path: bookPath,
      createdAt: Date.now(),
      size: formatFileSize(file.size),
      chapterCount: epubMetadata.chapterCount || 0,
      coverPath,
      metaData: epubMetadata,
      status: 'local',
    };

    // Update config
    const config = await loadConfig();
    config.books.push(bookMetadata);

    // Add to hash map
    if (!config.hashMapFilePath) config.hashMapFilePath = {};
    config.hashMapFilePath[bookId] = bookPath;

    config.lastSync = Date.now();
    await saveConfig(config);

    return bookMetadata;
  }, 'upload book with hash');
}
```

### 5. Redux Actions

```typescript
// bookshelfSlice.ts
const bookshelfSlice = createSlice({
  name: 'bookshelf',
  initialState: {
    books: [],
    isLoading: false,
    error: null,
    presetBooksInitialized: false,
    downloadingCount: 0,
  },
  reducers: {
    addPlaceholderBook(state, action) {
      state.books.push(action.payload);
      state.downloadingCount += 1;
    },
    removePlaceholderBook(state, action) {
      state.books = state.books.filter((b) => b.id !== action.payload);
      state.downloadingCount -= 1;
    },
    replacePlaceholderBook(state, action) {
      const { tempId, book } = action.payload;
      const index = state.books.findIndex((b) => b.id === tempId);
      if (index !== -1) {
        state.books[index] = book;
        state.downloadingCount -= 1;
      }
    },
    updateDownloadProgress(state, action) {
      const { id, progress } = action.payload;
      const book = state.books.find((b) => b.id === id);
      if (book) book.downloadProgress = progress;
    },
    updateBookError(state, action) {
      const { id, error } = action.payload;
      const book = state.books.find((b) => b.id === id);
      if (book) {
        book.status = 'error';
        book.downloadError = error;
      }
      state.downloadingCount -= 1;
    },
  },
});

export const {
  addPlaceholderBook,
  removePlaceholderBook,
  replacePlaceholderBook,
  updateDownloadProgress,
  updateBookError,
} = bookshelfSlice.actions;
```

---

## UI Components

### Display Download Progress

```typescript
// HomePage.tsx
const HomePage = () => {
  const books = useAppSelector(state => state.bookshelf.books);
  const downloadingBooks = books.filter(b => b.status === 'downloading');

  return (
    <div>
      {downloadingBooks.length > 0 && (
        <div className="downloading-section">
          <h3>Downloading {downloadingBooks.length} books...</h3>
          {downloadingBooks.map(book => (
            <div key={book.id} className="download-item">
              <span>{book.name}</span>
              <progress value={book.downloadProgress} max={100} />
              <span>{book.downloadProgress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Regular books */}
      {books.filter(b => b.status === 'local').map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};
```

---

## Testing

### Critical Test Cases

1. **First-time user**: All preset books download
2. **Hot reload**: Removed books marked with `deletedAt`, filtered out
3. **Duplicate upload**: User uploads same EPUB manually → rejected
4. **Incomplete download**: App closes mid-download → resumes on next open
5. **New preset book**: Added to DEFAULT_PRESET_BOOKS → downloads on next open
6. **Route navigation**: Downloads continue when navigating away from HomePage
7. **Progress tracking**: UI updates smoothly during download

### Edge Cases

- Network failure during download
- Invalid EPUB file from remote
- Hash collision (extremely rare with SHA-256)
- Config corruption recovery
- Multiple downloads in parallel

---

## Migration Strategy

**Phase 1**: Implement hash-based storage for new uploads
**Phase 2**: Support reading both UUID and hash directories (backward compatibility)
**Phase 3**: Optional migration tool (future enhancement)

---

## Summary

This simplified specification focuses on the essential elements:

✅ **Data structures** with `deletedAt` for hot reload  
✅ **Background downloads** via Redux thunks  
✅ **Hot reload sync** logic  
✅ **Duplicate detection** using hash map index  
✅ **Implementation guide** with key code snippets  
✅ **Testing strategy**

**Total lines**: ~800 (vs. 2,800 original) - 71% reduction while keeping all critical information.
