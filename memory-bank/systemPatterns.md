# System Patterns: EPUB Reader Architecture

## Core Architecture Pattern - COMPLETE IMPLEMENTATION

### Component-Based Architecture - CURRENT STATE

```
Application Layer
├── Pages (Route-level components)
│   ├── BookshelfPage ✅ (complete library management)
│   ├── EpubReader ⚠️ (placeholder - needs EPUB.js)
│   ├── SettingsPage ⚠️ (placeholder - needs configuration)
│   └── SearchPage ❌ (future enhancement)
├── Components (Reusable UI)
│   ├── BookCard ✅ (responsive book display)
│   ├── UploadZone ✅ (drag-and-drop upload)
│   ├── DictionaryPopup ❌ (Phase 2)
│   ├── TOCSidebar ❌ (Phase 2)
│   └── ErrorBoundary ❌ (future enhancement)
├── Services (Business logic)
│   ├── OPFSManager ✅ (complete storage layer)
│   ├── EPUBMetadataService ✅ (metadata extraction)
│   ├── AI integration ❌ (Phase 3)
│   ├── Dictionary API ❌ (Phase 2)
│   └── Settings ❌ (Phase 2)
└── Store (State management)
    ├── Redux Toolkit slices ✅ (bookshelfSlice complete)
    └── Persistence layer ✅ (OPFS-based)
```

### Data Flow Architecture - IMPLEMENTED

```
User Action → Component → Redux Action → Service Layer → OPFS/EPUB.js → State Update → Component Re-render
```

## Storage Patterns - COMPLETE IMPLEMENTATION

### OPFS (Origin Private File System) Strategy - FULLY IMPLEMENTED

```
/books/
    {book-id}/
        book-name.epub
        cover.jpg|png|webp
/config.json (metadata + settings)
/search-index/ (future: search indexing)
```

**Key OPFS Patterns - IMPLEMENTED:**

1. **Singleton Pattern**: OPFSManager uses singleton pattern for consistent access
2. **Feature Detection**: Comprehensive browser support checking with graceful fallbacks
3. **Atomic Operations**: Always write complete files, never partial updates
4. **Error Recovery**: Validate file integrity after writes with config recreation
5. **Metadata Separation**: Store book metadata separately from file content
6. **Lazy Loading**: Only load book content when actively reading
7. **Directory Structure**: Organized by book ID for clean separation

### Configuration Schema Pattern - IMPLEMENTED

```typescript
interface OPFSConfig {
  version: 1;
  books: BookMetadata[];
  settings: AppSettings;
  lastSync: number;
}

interface BookMetadata {
  id: string; // UUID for internal reference
  name: string; // Display name
  path: string; // OPFS relative path
  author?: string;
  coverPath?: string;
  createdAt: number;
  lastRead?: number;
  progress?: number; // 0-100 percentage
  size?: string; // Human-readable size
  chapterCount?: number;
  totalPages?: number;
  metaData?: EPUBMetaData; // Extracted EPUB metadata
}
```

## Component Patterns - IMPLEMENTED

### Redux Async Thunk Pattern - IMPLEMENTED

```typescript
// Three-phase pattern for all async operations
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
```

### Service Layer Pattern - IMPLEMENTED

```typescript
// Three-phase pattern for all service operations
export async function uploadBook(file: File): Promise<BookMetadata> {
  // 1. Input handling - validate file type and size
  if (!file.name.toLowerCase().endsWith('.epub')) {
    throw new Error('Only EPUB files are supported');
  }

  // 2. Core processing - save file and extract metadata
  const bookId = uuidv4();
  // ... file operations ...

  // 3. Output handling - return metadata
  return bookMetadata;
}
```

### Component Pattern - IMPLEMENTED

```typescript
// Standard component pattern with three-phase logic
export const BookCard: React.FC<BookCardProps> = ({ book, onOpen, onDelete }) => {
  // 1. Input handling - validate book data
  if (!book || !book.id) {
    return null;
  }

  // 2. Core processing - format display data
  const displayName = book.name || 'Untitled Book';
  const displayAuthor = book.author
```
