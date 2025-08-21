# System Patterns: EPUB Reader Architecture

## Core Architecture Pattern

### Component-Based Architecture

```
Application Layer
├── Pages (Route-level components)
│   ├── BookshelfPage (Library management) ✅
│   ├── EpubReader (Reading interface) ⚠️
│   ├── SearchPage (Global search) ❌
│   └── SettingsPage (Configuration) ⚠️
├── Components (Reusable UI)
│   ├── BookCard ✅, DictionaryPopup ❌, TOCSidebar ❌
│   ├── UploadZone ✅, common components
│   └── ErrorBoundary ❌
├── Services (Business logic)
│   ├── OPFSManager ✅ (complete storage layer)
│   ├── EPUBMetadataService ✅ (metadata extraction)
│   ├── AI integration ❌, Dictionary API ❌
│   └── Settings ❌, Search indexing ❌
└── Store (State management)
    ├── Redux Toolkit slices ✅
    └── Persistence layer ✅
```

### Data Flow Architecture

```
User Action → Component → Redux Action → Service Layer → External API/Storage → State Update → Component Re-render
```

## Storage Patterns

### OPFS (Origin Private File System) Strategy ✅ **IMPLEMENTED**

```
/books/
    book1.epub
    book2.epub
    covers/
        book1-cover.jpg
        book2-cover.jpg
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

### Configuration Schema Pattern ✅ **IMPLEMENTED**

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

## Component Patterns

### Redux Async Thunk Pattern ✅ **IMPLEMENTED**

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

### Service Layer Pattern ✅ **IMPLEMENTED**

```typescript
// Three-phase pattern for all service operations
class OPFSManager {
  async uploadBook(file: File): Promise<BookMetadata> {
    // 1. Input handling - validate file
    if (!file.name.toLowerCase().endsWith('.epub')) {
      throw new Error('Only EPUB files are supported');
    }

    // 2. Core processing - save file and extract metadata
    const bookId = uuidv4();
    // ... file operations ...

    // 3. Output handling - return metadata
    return bookMetadata;
  }
}
```

### Component Pattern ✅ **IMPLEMENTED**

```typescript
// Standard component pattern with three-phase logic
export const BookCard: React.FC<BookCardProps> = ({ book, onOpen, onDelete }) => {
  // 1. Input handling - validate book data
  if (!book || !book.id) {
    return null;
  }

  // 2. Core processing - format display data
  const displayName = book.name || 'Untitled Book';
  const displayAuthor = book.author || 'Unknown Author';

  // 3. Output handling - render book card
  return (
    <div className="book-card">
      {/* Responsive book display */}
    </div>
  );
};
```

### Error Handling Pattern ✅ **IMPLEMENTED**

```typescript
// Comprehensive error handling with
```
