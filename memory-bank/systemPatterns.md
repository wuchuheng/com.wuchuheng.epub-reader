# System Patterns: EPUB Reader Architecture

## Core Architecture Pattern - COMPLETE IMPLEMENTATION

### Component-Based Architecture - CURRENT STATE

```
Application Layer
├── Pages (Route-level components)
│   ├── BookshelfPage ✅ (complete library management)
│   ├── EpubReader ✅ (complete with EPUB.js integration)
│   ├── SettingsPage ⚠️ (placeholder - needs configuration)
│   └── SearchPage ❌ (future enhancement)
├── Components (Reusable UI)
│   ├── BookCard ✅ (responsive book display)
│   ├── UploadZone ✅ (drag-and-drop upload)
│   ├── ReaderHeader ✅ (top navigation with icons)
│   ├── ReaderContent ✅ (main layout management)
│   ├── ReaderFooter ✅ (progress and navigation controls)
│   ├── NavigationBar ✅ (orchestrator component)
│   ├── ProgressBar ✅ (progress display component)
│   ├── NavigationControls ✅ (page navigation buttons)
│   ├── ActionButtons ✅ (TOC and settings toggle buttons)
│   ├── TOCSidebar ✅ (collapsible table of contents)
│   ├── ReaderView ✅ (main reader display component)
│   ├── DictionaryPopup ❌ (Phase 3)
│   └── ErrorBoundary ❌ (future enhancement)
├── Services (Business logic)
│   ├── OPFSManager ✅ (complete storage layer)
│   ├── EPUBMetadataService ✅ (metadata extraction)
│   ├── AI integration ❌ (Phase 3)
│   ├── Dictionary API ❌ (Phase 3)
│   └── Settings ❌ (Phase 3)
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

## Type Interface Patterns - RECENTLY IMPLEMENTED

### Reader Instance Pattern - IMPLEMENTED

```typescript
/**
 * Reader instance interface combining book state with navigation methods
 * Used across ReaderContent and ReaderFooter components for consistent typing
 */
interface ReaderInstance {
  book: Book | null;
  rendition: Rendition | null;
  isLoading: boolean;
  error: string | null;
  currentLocation: string | null;
  goToChapter?: (href: string) => void;
}
```

### Component Prop Interface Pattern - IMPLEMENTED

```typescript
/**
 * Standardized prop interfaces for reader components
 * Ensures type safety and consistent data flow
 */
interface ReaderContentProps {
  bookId: string;
  reader: ReaderInstance;
  navigation: BookNavigationResult;
  isTocOpen: boolean;
  setIsTocOpen: (open: boolean) => void;
}

interface ReaderFooterProps {
  reader: ReaderInstance;
  navigation: BookNavigationResult;
}

interface TOCSidebarProps {
  tableOfContents: TocItem[];
  currentChapter: string | null;
  onChapterSelect: (href: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}
```

### Type Safety Pattern - IMPLEMENTED

```typescript
/**
 * Complete type elimination pattern
 * Replaced all 'any' types with proper interfaces
 */
export type NoAnyTypes = {
  reader: ReaderInstance; // Instead of 'any'
  navigation: BookNavigationResult; // Instead of 'any'
  location: EpubLocation; // Instead of 'any'
  book: Book | null; // Instead of 'any'
};
```

## Code Quality Patterns - RECENTLY IMPLEMENTED

### Import Cleanup Pattern - IMPLEMENTED

```typescript
// Remove unused imports to eliminate ESLint warnings
// Before: import React, { useState } from 'react';
// After: import React from 'react';
```

### Unused Parameter Pattern - IMPLEMENTED

```typescript
// Prefix unused parameters with underscore to indicate intentional non-use
export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  isTocOpen,
  setIsTocOpen,
  isFullscreen: _isFullscreen, // Prefixed with underscore
  setIsFullscreen,
}) => {
```

### Prop Naming Consistency Pattern - IMPLEMENTED

```typescript
// Standardized prop naming across components
interface ConsistentProps {
  tableOfContents: TocItem[]; // Not 'toc'
  currentChapter: string | null; // Not 'currentLocation'
  onChapterSelect: (href: string) => void; // Not 'onNavigate'
  onToggle: () => void; // Not 'onClose'
}
```

## Integration Patterns - IMPLEMENTED

### Component Communication Pattern - IMPLEMENTED

```typescript
/**
 * Clean data flow between components using typed interfaces
 * ReaderContent orchestrates between TOCSidebar and ReaderFooter
 */
export const ReaderContent: React.FC<ReaderContentProps> = ({
  bookId,
  reader,
  navigation,
  isTocOpen,
  setIsTocOpen,
}) => {
  const handleTocNavigate = (href: string) => {
    reader.goToChapter?.(href);
    setIsTocOpen(false);
  };

  return (
    <div className="flex-1 flex relative">
      <TOCSidebar
        tableOfContents={navigation.tableOfContents}
        currentChapter={navigation.currentChapter}
        onChapterSelect={handleTocNavigate}
        onToggle={() => setIsTocOpen(false)}
        isOpen={isTocOpen}
      />
      <ReaderFooter reader={reader} navigation={navigation} />
    </div>
  );
};
```
