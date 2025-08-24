# System Patterns: EPUB Reader Architecture

## Core Architecture Pattern - COMPLETE IMPLEMENTATION

### Component-Based Architecture - CURRENT STATE

```
Application Layer
├── Pages (Route-level components)
│   ├── BookshelfPage ✅ (complete library management)
│   ├── EpubReader ✅ (complete with consolidated `useReader` hook)
│   ├── SettingsPage ✅ (updated with navigation components)
│   ├── ContextMenuSettingsPage ✅ (new context menu settings)
│   └── SearchPage ❌ (future enhancement)
├── Components (Reusable UI)
│   ├── BookCard ✅ (responsive book display)
│   ├── UploadZone ✅ (drag-and-drop upload)
│   ├── ReaderHeader ✅ (top navigation with icons)
│   ├── ReaderFooter ✅ (progress and navigation controls)
│   ├── TOCSidebar ✅ (collapsible table of contents)
│   ├── ReaderView ✅ (main reader display component)
│   ├── MenuButton ✅ (menu toggle)
│   ├── ErrorRender ✅ (error/loading display)
│   ├── Loading ✅ (loading indicator)
│   ├── ActionButtons.tsx (utility buttons, if used by ReaderHeader)
│   ├── NavigationControls.tsx (page nav buttons, if used by ReaderFooter)
│   ├── ProgressBar.tsx (progress display, if used by ReaderFooter)
│   ├── Container ✅ (layout with sticky header)
│   ├── BackButton ✅ (navigation component)
│   ├── Breadcrumb ✅ (navigation trail component)
│   ├── DictionaryPopup ❌ (Phase 3)
│   └── ErrorBoundary ❌ (future enhancement)
├── Services (Business logic)
│   ├── OPFSManager ✅ (complete storage layer)
│   ├── EPUBMetadataService ✅ (metadata extraction, used by `EpubReader/index.tsx`)
│   ├── AI integration ❌ (Phase 3)
│   ├── Dictionary API ❌ (Phase 3)
│   └── Settings ❌ (Phase 3)
└── Store (State management)
    ├── Redux Toolkit slices ✅ (bookshelfSlice complete)
    └── Persistence layer ✅ (OPFS-based)
```

_Note: Components like `ActionButtons`, `NavigationControls`, `ProgressBar` might be sub-components or their functionality integrated into `ReaderHeader`/`ReaderFooter` based on the actual implementation._

### Data Flow Architecture - IMPLEMENTED & REFINED

```
User Action → Component → `useReader` Hook / EPUB.js → State Update → Component Re-render
```

_Refinement_: Book loading is now `EpubReader/index.tsx` → `EPUBMetadataService` → `useReader` (for rendition).

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

1.  **Singleton Pattern**: OPFSManager uses singleton pattern for consistent access.
2.  **Feature Detection**: Comprehensive browser support checking with graceful fallbacks.
3.  **Atomic Operations**: Always write complete files, never partial updates.
4.  **Error Recovery**: Validate file integrity after writes with config recreation.
5.  **Metadata Separation**: Store book metadata separately from file content.
6.  **Lazy Loading**: Only load book content when actively reading.
7.  **Directory Structure**: Organized by book ID for clean separation.

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
  lastRead?: number; // Potentially updated by `latestReadingLocation` logic
  progress?: number; // 0-100 percentage
  size?: string; // Human-readable size
  chapterCount?: number;
  totalPages?: number;
  metaData?: EPUBMetaData; // Extracted EPUB metadata
}
```

## Component Patterns - IMPLEMENTED & REFINED

### Redux Async Thunk Pattern - IMPLEMENTED

```typescript
// Three-phase pattern for all async operations (e.g., in bookshelfSlice)
export const uploadBook = createAsyncThunk(
  'bookshelf/uploadBook',
  async (file: File, { rejectWithValue }) => {
    try {
      // 1. Input handling - validate file
      validateFile(file);

      // 2. Core processing - upload book via OPFSManager
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
// Three-phase pattern for all service operations (e.g., EPUBMetadataService)
export async function getBookByBookId(bookId: string): Promise<Book> {
  // 1. Input handling - validate bookId
  if (!bookId) {
    throw new Error('Book ID is required');
  }

  // 2. Core processing - get book file from OPFS and create Book instance
  const opfs = OPFSManager.getInstance();
  const bookFile = await opfs.getBookFile(bookId);
  const bookInstance = new Book(bookFile);
  await bookInstance.ready; // Ensure book is ready before returning

  // 3. Output handling - return book instance
  return bookInstance;
}
```

### Consolidated Hook Pattern - IMPLEMENTED (`useReader`)

```typescript
// `useReader` hook: Centralizes all reader logic
export const useReader = (props: UseReaderProps): UseReaderReturn => {
  // 1. State & Refs for rendition, navigation, TOC, page tracking, location
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  // ... other states and refs

  // 2. Core book rendering and event setup logic
  const onRenderBook = async () => {
    // Rendition setup, event listeners (relocated, rendered), TOC extraction
    // Navigation function definitions (goToNext, goToPrev, goToSelectChapter)
    // Location persistence logic (latestReadingLocation)
  };

  // 3. Effects for book rendering and keyboard events
  useEffect(() => {
    /* book rendering */
  }, [props.book, containerRef]);
  useEffect(() => {
    /* keyboard listener */
  }, []);

  // 4. Return comprehensive state and functions
  return {
    containerRef,
    tableOfContents,
    totalPages,
    currentPage,
    currentChapterHref,
    goToNext,
    goToPrev,
    goToSelectChapter,
  };
};
```

## Type Interface Patterns - RECENTLY IMPLEMENTED

### Reader Hook Pattern - IMPLEMENTED (`UseReaderReturn`)

```typescript
/**
 * Consolidated reader instance interface combining book state with navigation methods
 * Used by EpubReader component for consistent typing and state access
 */
interface UseReaderReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  tableOfContents: TocItem[];
  totalPages: number;
  currentPage: number;
  currentChapterHref: string;
  goToNext: () => void;
  goToPrev: () => void;
  goToSelectChapter: (href: string) => void;
}

interface UseReaderProps {
  book: Book;
}
```

### Component Prop Interface Pattern - IMPLEMENTED & REFINED

```typescript
/**
 * Standardized prop interfaces for reader components
 * Ensures type safety and consistent data flow from `useReader`
 */
interface TOCSidebarProps {
  currentChapter: string | null; // Receives currentChapterHref
  onChapterSelect: (href: string) => void; // Receives goToSelectChapter
  isOpen: boolean;
  onToggle: () => void;
  tableOfContents: TocItem[]; // Receives from useReader
}

interface ReaderFooterProps {
  currentPage: number; // Receives from useReader
  totalPages: number; // Receives from useReader
  onNext: () => void; // Receives goToNext
  onPrev: () => void; // Receives goToPrev
  visible: boolean; // Internal state from EpubReader
}
```

### Type Safety Pattern - IMPLEMENTED

```typescript
/**
 * Complete type elimination pattern
 * Replaced all 'any' types with proper interfaces
 * `useReader` provides strongly-typed returns
 */
export type NoAnyTypesInReader = {
  readerProps: UseReaderProps; // Instead of 'any'
  readerReturn: UseReaderReturn; // Instead of 'any'
  tocItem: TocItem; // Instead of 'any'
  renditionLocation: RenditionLocation; // Instead of 'any'
  book: Book | null; // Instead of 'any'
};
```

## Code Quality Patterns - RECENTLY IMPLEMENTED

### Import Cleanup Pattern - IMPLEMENTED

```typescript
// Remove unused imports to eliminate ESLint warnings (e.g., TOCSidebar.tsx)
// Before: import React, { useEffect } from 'react'; import { Book } from 'epubjs';
// After: import React from 'react';
```

### Unused Parameter Pattern - IMPLEMENTED

```typescript
// Prefix unused parameters with underscore to indicate intentional non-use
// (Example from other components, if applicable)
// export const SomeComponent: React.FC<SomeProps> = ({ usedProp, _unusedProp }) => {
```

### Prop Naming Consistency Pattern - IMPLEMENTED

```typescript
// Standardized prop naming from `useReader` to components
interface ConsistentReaderProps {
  tableOfContents: TocItem[]; // From useReader
  currentChapterHref: string | null; // From useReader, becomes currentChapter in TOCSidebar
  goToSelectChapter: (href: string) => void; // From useReader, becomes onChapterSelect in TOCSidebar
  goToNext: () => void; // From useReader, becomes onNext in ReaderFooter
  goToPrev: () => void; // From useReader, becomes onPrev in ReaderFooter
  currentPage: number; // From useReader
  totalPages: number; // From useReader
}
```

## Integration Patterns - IMPLEMENTED & REFINED

### Component Communication Pattern - IMPLEMENTED (via `useReader`)

```typescript
/**
 * Clean data flow between components using typed state from `useReader`
 * `EpubReaderRender` (in index.tsx) orchestrates by consuming `useReader`
 * and passing down necessary state and functions.
 */
// In EpubReader/index.tsx (EpubReaderRender component)
const {
  containerRef,
  goToNext: onNext, // Renamed for clarity in props
  goToPrev: onPrev, // Renamed for clarity in props
  tableOfContents,
  goToSelectChapter, // Passed directly
  currentPage,
  totalPages,
  currentChapterHref,
} = useReader({
  book: props.book,
});

return (
  <div className="relative flex h-screen flex-col bg-white">
    <ReaderHeader visible={menuVisible} onOpenToc={onToggleToc} />
    <TOCSidebar
      isOpen={tocVisible}
      currentChapter={currentChapterHref} // State from useReader
      onChapterSelect={goToSelectChapter} // Function from useReader
      onToggle={() => setTocVisible(false)}
      tableOfContents={tableOfContents} // State from useReader
    />
    {/* ... other components like MenuButton, ReaderView ... */}
    <ReaderFooter
      visible={menuVisible}
      currentPage={currentPage} // State from useReader
      totalPages={totalPages} // State from useReader
      onNext={onNext} // Function from useReader
      onPrev={onPrev} // Function from useReader
    />
  </div>
);
```

### Persistent State Pattern - IMPLEMENTED (`latestReadingLocation`)

```typescript
/**
 * Utility for persistent reading location within `useReader`
 * Uses localStorage keyed by bookId for CFI storage.
 */
const latestReadingLocation = {
  prefix: 'latestReadingLocation_',
  getCfi: (key: string): string | null =>
    localStorage.getItem(`${latestReadingLocation.prefix}${key}`),
  setCfi: (key: string, cfi: string): void => {
    localStorage.setItem(`${latestReadingLocation.prefix}${key}`, cfi);
  },
};

// Usage within `useReader`'s rendition.on('relocated', ...)
latestReadingLocation.setCfi(bookId!, location.start.cfi);

// Usage when displaying the book:
const latestCfi = latestReadingLocation.getCfi(bookId!);
rendition.display(latestCfi || undefined);
```

## Navigation & Settings Component Patterns - IMPLEMENTED

### Container Layout Pattern - IMPLEMENTED

```typescript
/**
 * Flexible container component with sticky header and scrollable content
 * Provides consistent layout structure for settings pages with optimized Tailwind classes
 */
interface ContainerProps {
  breadcrumbItems: BreadcrumbItem[];
  backTo: string;
  children?: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = (props) => {
  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      <header className="sticky top-0 border-b bg-white shadow-sm">
        {/* Header content with BackButton and Breadcrumb */}
      </header>
      <main className="flex-1 overflow-y-auto">{props.children}</main>
    </div>
  );
};
```

### Navigation Components Pattern - IMPLEMENTED & IN PRODUCTION

```typescript
/**
 * BackButton component for consistent navigation across settings pages
 * Simple, reusable button with icon support and proper TypeScript typing
 */
interface BackButtonProps {
  to: string;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ to, label }) => {
  return (
    <Link to={to} className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors">
      <ArrowLeftIcon className="h-5 w-5" />
      {label && <span>{label}</span>}
    </Link>
  );
};

/**
 * Breadcrumb component for hierarchical navigation trails
 * Shows current location in settings hierarchy with proper TypeScript interfaces
 */
interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400" aria-hidden="true">/</span>}
          {item.path ? (
            <Link 
              to={item.path} 
              className="text-blue-600 hover:text-blue-800 transition-colors"
              aria-current={index === items.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
```

### Settings Page Pattern - IMPLEMENTED & IN PRODUCTION

```typescript
/**
 * Settings page structure using Container component
 * Consistent layout for all settings pages with proper navigation hierarchy
 */
export const SettingsPage: React.FC = () => {
  return (
    <Container
      backTo="/settings"
      breadcrumbItems={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'General Settings' },
      ]}
    >
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">General Settings</h1>
        {/* Settings form content - reading preferences, appearance, etc. */}
      </div>
    </Container>
  );
};

export const ContextMenuSettingsPage: React.FC = () => {
  return (
    <Container
      backTo="/settings"
      breadcrumbItems={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Context Menu' },
      ]}
    >
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Context Menu Settings</h1>
        {/* Context menu settings content - dictionary, AI tools, custom prompts */}
      </div>
    </Container>
  );
};
```

### Routing Integration Pattern - IMPLEMENTED & IN PRODUCTION

```typescript
/**
 * React Router configuration for settings pages
 * Nested routing structure for organized settings with proper navigation hierarchy
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <BookshelfPage /> },
      { path: '/book/:bookId', element: <EpubReader /> },
      {
        path: '/settings',
        element: <SettingsPage />,
        children: [
          { index: true, element: <GeneralSettings /> },
          { path: 'context-menu', element: <ContextMenuSettingsPage /> },
          { path: 'ai-providers', element: <AIProviderSettings /> },
          { path: 'reading-preferences', element: <ReadingPreferencesSettings /> },
        ],
      },
    ],
  },
]);
```
