# System Patterns: EPUB Reader Architecture

## Core Architecture Pattern

### Component-Based Architecture

```
Application Layer
├── Pages (Route-level components)
│   ├── BookshelfPage (Library management)
│   ├── EpubReader (Reading interface)
│   ├── SearchPage (Global search)
│   └── SettingsPage (Configuration)
├── Components (Reusable UI)
│   ├── BookCard, DictionaryPopup, TOCSidebar
│   └── TopMenuBar, common components
├── Services (Business logic)
│   ├── OPFS management, EPUB parsing
│   ├── AI integration, Dictionary API
│   └── Settings, Search indexing
└── Store (State management)
    ├── Redux Toolkit slices
    └── Persistence layer
```

### Data Flow Architecture

```
User Action → Component → Redux Action → Service Layer → External API/Storage → State Update → Component Re-render
```

## Storage Patterns

### OPFS (Origin Private File System) Strategy

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

**Key OPFS Patterns:**

1. **Atomic Operations**: Always write complete files, never partial updates
2. **Error Recovery**: Validate file integrity after writes
3. **Metadata Separation**: Store book metadata separately from file content
4. **Lazy Loading**: Only load book content when actively reading

### Configuration Schema Pattern

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
}
```

## Component Patterns

### Dictionary Popup System

**Modular Tab Architecture:**

```
DictionaryPopup
├── TabManager (handles tab switching)
├── DefaultTabs (Dictionary, AI, Custom)
├── DynamicTabs (user-created tools)
└── TabContent (rendered based on active tab)
```

**Tab Registration Pattern:**

```typescript
interface TabConfig {
  id: string;
  name: string;
  shortName?: string; // For responsive display
  type: 'default' | 'custom';
  component: React.ComponentType<TabProps>;
  isActive: boolean;
  order: number;
}

// Dynamic tab registration
const registerCustomTool = (tool: CustomAITool) => {
  const tabConfig: TabConfig = {
    id: tool.id,
    name: tool.name,
    shortName: tool.shortName,
    type: 'custom',
    component: CustomToolTab,
    isActive: tool.isActive,
    order: tool.order,
  };
  return tabConfig;
};
```

### Responsive Design Pattern

**Mobile-First Approach:**

1. Base styles for mobile (320px)
2. Progressive enhancement for tablet (768px)
3. Full features for desktop (1024px+)

**Key Responsive Behaviors:**

- Tab names: Full → Short → Icon (based on available width)
- Sidebar: Overlay → Side panel → Fixed panel
- Reading area: Single column → Multi-column

## State Management Patterns

### Redux Toolkit Structure

```
store/
├── index.ts (store configuration)
└── slices/
    ├── bookshelfSlice.ts (library management)
    ├── readerSlice.ts (reading state)
    ├── dictionarySlice.ts (popup state)
    ├── settingsSlice.ts (user preferences)
    └── searchSlice.ts (search functionality)
```

### State Persistence Pattern

```typescript
// Settings persistence to localStorage
const persistSettingsMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // 1. Input handling - check if settings changed
  if (action.type.startsWith('settings/')) {
    const state = store.getState();

    // 2. Core processing - serialize and store
    localStorage.setItem('epub-reader-settings', JSON.stringify(state.settings));
  }

  // 3. Output handling
  return result;
};
```

### Async Action Patterns

```typescript
// Thunk pattern for OPFS operations
export const uploadBookToOPFS = createAsyncThunk(
  'bookshelf/uploadBook',
  async (file: File, { rejectWithValue }) => {
    try {
      // 1. Input handling
      if (!file || file.size > MAX_FILE_SIZE) {
        throw new Error('Invalid file or size too large');
      }

      // 2. Core processing
      const bookId = generateBookId();
      const metadata = await extractBookMetadata(file);
      await saveBookToOPFS(bookId, file);
      await updateOPFSConfig(bookId, metadata);

      // 3. Output handling
      return { bookId, metadata };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## Service Layer Patterns

### AI Service Architecture

```typescript
// Provider abstraction pattern
interface AIProvider {
  name: string;
  baseUrl: string;
  authenticate(token: string): boolean;
  generateResponse(prompt: string, context: string): Promise<string>;
  testConnection(): Promise<boolean>;
}

class AIServiceFactory {
  static createProvider(type: 'openai' | 'anthropic' | 'custom', config: AIConfig): AIProvider {
    switch (type) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'custom':
        return new CustomProvider(config);
    }
  }
}
```

### EPUB Processing Pipeline

```typescript
// Staged processing pattern
class EPUBProcessor {
  async processBook(file: File): Promise<BookData> {
    // 1. Input handling - validate EPUB structure
    const isValid = await this.validateEPUB(file);
    if (!isValid) throw new Error('Invalid EPUB file');

    // 2. Core processing - extract in stages
    const metadata = await this.extractMetadata(file);
    const toc = await this.extractTOC(file);
    const chapters = await this.extractChapters(file);
    const cover = await this.extractCover(file);

    // 3. Output handling - combine results
    return { metadata, toc, chapters, cover };
  }
}
```

## Error Handling Patterns

### Graceful Degradation Strategy

```typescript
// Feature detection and fallback
class FeatureDetector {
  static hasOPFS(): boolean {
    return 'storage' in navigator && 'getDirectory' in navigator.storage;
  }

  static hasFileSystemAccess(): boolean {
    return 'showOpenFilePicker' in window;
  }

  static async getStorageStrategy(): Promise<'opfs' | 'indexeddb' | 'memory'> {
    if (this.hasOPFS()) {
      try {
        await navigator.storage.getDirectory();
        return 'opfs';
      } catch {
        return 'indexeddb';
      }
    }
    return 'memory';
  }
}
```

### Error Boundary Pattern

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class AppErrorBoundary extends Component<Props, ErrorBoundaryState> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 1. Input handling - categorize error
    const errorCategory = this.categorizeError(error);

    // 2. Core processing - log and recover
    this.logError(error, errorInfo, errorCategory);
    this.attemptRecovery(errorCategory);

    // 3. Output handling - update UI
    this.setState({ hasError: true, error, errorInfo });
  }
}
```

## Performance Patterns

### Lazy Loading Strategy

```typescript
// Component-level lazy loading
const BookshelfPage = lazy(() => import('../pages/BookshelfPage'));
const EpubReader = lazy(() => import('../pages/EpubReader'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

// EPUB content lazy loading
class ChapterManager {
  private loadedChapters = new Map<string, ChapterContent>();
  private loadQueue: string[] = [];

  async loadChapter(chapterId: string): Promise<ChapterContent> {
    // 1. Input handling - check cache first
    if (this.loadedChapters.has(chapterId)) {
      return this.loadedChapters.get(chapterId)!;
    }

    // 2. Core processing - load and cache
    const content = await this.fetchChapterContent(chapterId);
    this.loadedChapters.set(chapterId, content);

    // 3. Output handling - cleanup old chapters
    this.cleanupOldChapters();
    return content;
  }
}
```

### Memory Management Pattern

```typescript
// Cleanup on component unmount
useEffect(() => {
  return () => {
    // 1. Cleanup EPUB.js instances
    if (epubRef.current) {
      epubRef.current.destroy();
    }

    // 2. Clear chapter cache
    chapterManager.clearCache();

    // 3. Cancel pending requests
    abortController.abort();
  };
}, []);
```

## Security Patterns

### Content Security Policy

```typescript
// Sanitize user-generated content (custom AI prompts)
const sanitizePrompt = (prompt: string): string => {
  // 1. Input handling - validate input
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Invalid prompt');
  }

  // 2. Core processing - sanitize dangerous content
  const sanitized = prompt
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  // 3. Output handling - return safe content
  return sanitized.trim();
};
```

### API Key Security

```typescript
// Secure API key handling
class SecureStorage {
  static setAPIKey(provider: string, key: string): void {
    // 1. Input handling - validate key format
    if (!this.validateKeyFormat(provider, key)) {
      throw new Error('Invalid API key format');
    }

    // 2. Core processing - encrypt and store
    const encrypted = this.encrypt(key);
    localStorage.setItem(`api-key-${provider}`, encrypted);
  }

  static getAPIKey(provider: string): string | null {
    // Decrypt and return key
    const encrypted = localStorage.getItem(`api-key-${provider}`);
    return encrypted ? this.decrypt(encrypted) : null;
  }
}
```

## Integration Patterns

### Plugin Architecture (Future)

```typescript
// Extensible plugin system for custom tools
interface Plugin {
  id: string;
  name: string;
  version: string;
  initialize(context: PluginContext): Promise<void>;
  destroy(): Promise<void>;
}

class PluginManager {
  private plugins = new Map<string, Plugin>();

  async registerPlugin(plugin: Plugin): Promise<void> {
    // 1. Input handling - validate plugin
    await this.validatePlugin(plugin);

    // 2. Core processing - initialize and register
    await plugin.initialize(this.createContext());
    this.plugins.set(plugin.id, plugin);

    // 3. Output handling - update UI
    this.notifyPluginRegistered(plugin);
  }
}
```
