# Tech Context: EPUB Reader Technology Stack

## Core Technology Stack

### Frontend Framework

- **React 18.3.1**: Component-based UI with concurrent features
- **TypeScript 5.5.3**: Type safety and enhanced developer experience
- **Vite 5.4.8**: Fast build tool with HMR and optimized bundling

### State Management

- **Redux Toolkit 2.3.0**: Predictable state management with RTK Query
- **React Redux 9.1.2**: React bindings for Redux
- **Redux Thunk 3.1.0**: Async action handling

### Routing & Navigation

- **React Router DOM 6.27.0**: Client-side routing with data APIs

### Styling & UI

- **TailwindCSS 3.4.14**: Utility-first CSS framework with sticky positioning
- **PostCSS 8.4.47**: CSS processing and autoprefixing
- **CSS Modules + LESS 4.2.0**: Component-scoped styling

### Component Architecture

- **Container Component**: ✅ Layout with sticky header and scrollable content area
- **BackButton Component**: ✅ Reusable navigation button with icon support and hover effects
- **Breadcrumb Component**: ✅ Hierarchical navigation trail with accessibility features
- **Settings Pages**: ✅ ContextMenuSettingsPage and enhanced SettingsPage with navigation
- **Reader Components**: ✅ Complete reader interface with Header, Footer, TOC, and View
- **Tool Management Components**: ✅ Comprehensive tool management system with specialized forms
- **Modal System**: ✅ AddToolDialog with dynamic form rendering and step-by-step workflow
- **Form Components**: ✅ AIToolForm, IframeToolForm, ToolForm for different tool types with validation
- **Input Components**: ✅ ModelSearchInput with autocomplete, ToolTypeSelector for visual selection
- **List Components**: ✅ ToolList with drag-and-drop ordering and status indicators
- **Validation Components**: ✅ Real-time form validation with error feedback and success indicators
- **Loading Components**: ✅ Loading states for async operations with skeleton screens
- **Error Components**: ✅ Error boundaries and graceful error handling throughout the application
- **Mobile Optimization Components**: ✅ ToolExtractPage with full-page form layout optimized for mobile devices

### Build & Development Tools

- **ESLint 9.11.1**: Code linting with TypeScript support and React rules
- **Prettier 3.3.3**: Code formatting with consistent style
- **Autoprefixer 10.4.20**: CSS vendor prefixing
- **TypeScript 5.5.3**: Type checking and compilation
- **Vite 5.4.8**: Fast build tool with HMR and optimized bundling
- **React Router 6.27.0**: Client-side routing with data APIs
- **Redux Toolkit 2.3.0**: State management with RTK Query

## Critical Dependencies

### EPUB Processing ✅ IMPLEMENTED

```json
{
  "epubjs": "^0.3.93",
  "@types/epubjs": "^0.3.x"
}
```

**Purpose**: Core EPUB parsing, rendering, and navigation
**Key Features**: Chapter loading, TOC extraction, metadata parsing
**Status**: ✅ Fully integrated with comprehensive TypeScript types in `src/types/epub.ts`

### PWA & Service Worker ⏳ PENDING

```json
{
  "workbox-webpack-plugin": "^7.0.0",
  "workbox-window": "^7.0.0"
}
```

**Purpose**: Offline functionality, caching strategies, PWA manifest
**Status**: ⏳ Ready for Phase 4 implementation

### File System Access ✅ IMPLEMENTED

```json
{
  "@types/wicg-file-system-access": "^2023.10.5"
}
```

**Purpose**: TypeScript definitions for OPFS and File System Access API
**Status**: ✅ OPFSManager fully implemented with comprehensive browser support detection

### Utility Libraries ⏳ PENDING

```json
{
  "uuid": "^9.0.1",
  "@types/uuid": "^9.0.8",
  "jszip": "^3.10.1",
  "dompurify": "^3.0.8",
  "@types/dompurify": "^3.0.5"
}
```

**Status**: ⏳ Ready for Phase 3 implementation (dictionary/AI features)

## Browser API Integrations

### Origin Private File System (OPFS) ✅ IMPLEMENTED

```typescript
// Feature detection and implementation
const supportsOPFS = () => {
  return 'storage' in navigator && 'getDirectory' in navigator.storage;
};

// Basic OPFS operations
interface OPFSManager {
  getRoot(): Promise<FileSystemDirectoryHandle>;
  writeFile(path: string, data: ArrayBuffer): Promise<void>;
  readFile(path: string): Promise<ArrayBuffer>;
  deleteFile(path: string): Promise<void>;
  listFiles(directory?: string): Promise<string[]>;
  uploadBook(file: File): Promise<BookMetadata>;
  getBookFile(bookId: string): Promise<File>;
  getBookMetadata(bookId: string): Promise<BookMetadata>;
  deleteBook(bookId: string): Promise<void>;
}
```

### File System Access API ✅ IMPLEMENTED

```typescript
// File picker integration - fully implemented in OPFSManager
const openEPUBFile = async (): Promise<File> => {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [
      {
        description: 'EPUB files',
        accept: { 'application/epub+zip': ['.epub'] },
      },
    ],
    multiple: false,
  });
  return fileHandle.getFile();
};
```

**Status**: ✅ Fully implemented with fallback handling for unsupported browsers

### LocalStorage API ✅ IMPLEMENTED

```typescript
// Settings persistence - fully implemented for context menu settings
interface LocalStorageManager {
  saveSettings(settings: ContextMenuSettings): Promise<void>;
  loadSettings(): Promise<ContextMenuSettings>;
  migrateSettings(oldVersion: number, data: any): ContextMenuSettings;
  exportSettings(): string;
  importSettings(data: string): Promise<void>;
  clearSettings(): Promise<void>;
}

// Reading location persistence
interface ReadingLocationManager {
  saveLocation(bookId: string, cfi: string): Promise<void>;
  getLocation(bookId: string): Promise<string | null>;
  clearLocation(bookId: string): Promise<void>;
}
```

**Status**: ✅ Fully implemented with proper schema validation and error handling

### Web Workers ⏳ FUTURE (Phase 4)

```typescript
// Search indexing and heavy processing - planned for Phase 4
interface SearchWorker {
  indexBook(bookId: string, content: string[]): Promise<void>;
  search(query: string): Promise<SearchResult[]>;
  terminate(): void;
}
```

**Status**: ⏳ Planned for Phase 4 search functionality

## Development Environment Setup

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **Package Manager**: pnpm (recommended) or npm
- **Browser**: Chrome 86+, Firefox 102+, Safari 15.2+, Edge 86+

### Installation Commands

```bash
# Install dependencies
pnpm install

# Add EPUB processing
pnpm add epubjs @types/epubjs

# Add PWA dependencies
pnpm add workbox-webpack-plugin workbox-window

# Add utility libraries
pnpm add uuid jszip dompurify
pnpm add -D @types/uuid @types/dompurify @types/wicg-file-system-access

# Development server
pnpm dev

# Production build
pnpm build
pnpm preview
```

### Build Configuration

#### Vite Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,epub}'],
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB for large EPUBs
      },
      manifest: {
        name: 'EPUB Reader',
        short_name: 'EPUBReader',
        description: 'Offline EPUB reader with AI-enhanced features',
        theme_color: '#3B82F6',
        background_color: '#FFFFFF',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    include: ['epubjs', 'jszip'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          epub: ['epubjs'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
  },
});
```

## API Integration Specifications

### Dictionary API (Eudic) - READY FOR PHASE 3

```typescript
interface EudicAPIConfig {
  baseUrl: 'https://dict.eudic.net/dicts/MiniDictSearch2';
  parameters: {
    word: string;
    context: string;
    platform: 'extension';
  };
  responseFormat: 'html'; // Embedded iframe content
  iframeConfig: {
    width: number;
    height: number;
    sandbox: string;
    allow: string;
  };
}

// Implementation
const queryDictionary = async (word: string, context: string): Promise<string> => {
  const url = new URL('https://dict.eudic.net/dicts/MiniDictSearch2');
  url.searchParams.set('word', word);
  url.searchParams.set('context', context);
  url.searchParams.set('platform', 'extension');

  // Return URL for iframe embedding
  return url.toString();
};

// Iframe configuration for dictionary popup
const getDictionaryIframeConfig = (): IframeToolConfig => ({
  url: '', // Will be populated by queryDictionary
  width: 400,
  height: 300,
  sandbox: 'allow-scripts allow-same-origin allow-popups',
  allow: 'fullscreen; clipboard-read; clipboard-write',
});
```

### AI Provider APIs - READY FOR PHASE 3

#### OpenAI Integration

```typescript
interface OpenAIConfig {
  baseUrl: 'https://api.openai.com/v1';
  endpoints: {
    chat: '/chat/completions';
    models: '/models';
  };
  models: [
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
    'gpt-4',
    'gpt-4-turbo',
    'gpt-4-turbo-preview',
    'gpt-4-32k',
  ];
  headers: {
    Authorization: 'Bearer ${apiKey}';
    'Content-Type': 'application/json';
  };
  parameters: {
    maxTokens: number;
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
}

// Request/response types
interface OpenAIChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

#### Anthropic Integration

```typescript
interface AnthropicConfig {
  baseUrl: 'https://api.anthropic.com/v1';
  endpoints: {
    messages: '/messages';
    models: '/models';
  };
  models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'];
  headers: {
    'x-api-key': '${apiKey}';
    'anthropic-version': '2023-06-01';
    'Content-Type': 'application/json';
  };
  parameters: {
    maxTokens: number;
    temperature: number;
    topK: number;
    topP: number;
  };
}

// Request/response types
interface AnthropicMessageRequest {
  model: string;
  max_tokens: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  top_k?: number;
  top_p?: number;
  stream?: boolean;
}

interface AnthropicMessageResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
```

#### Custom AI Provider Integration

```typescript
interface CustomAIConfig {
  baseUrl: string; // User-provided API endpoint
  endpoints: {
    chat: '/chat'; // User-configurable endpoint
  };
  headers: {
    'Content-Type': 'application/json';
    [key: string]: string; // User-provided headers
  };
  parameters: {
    maxTokens: number;
    temperature: number;
    [key: string]: any; // User-configurable parameters
  };
}

// Request/response types for custom providers
interface CustomAIRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  [key: string]: any; // User-configurable parameters
}

interface CustomAIResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  [key: string]: any; // Provider-specific fields
}
```

## Performance Considerations

### Bundle Optimization

- **Code Splitting**: Lazy load pages and heavy dependencies with React.lazy()
- **Tree Shaking**: Remove unused code via ES modules and proper imports
- **Asset Optimization**: Compress images and fonts with modern formats
- **Chunk Strategy**: Separate vendor, app, EPUB processing, and AI provider code
- **Dynamic Imports**: Load AI provider libraries only when needed
- **Prefetching**: Prefetch critical routes and components

### Memory Management

```typescript
// EPUB.js memory optimization
const epubConfig = {
  width: '100%',
  height: '100%',
  allowScriptedContent: false, // Security
  manager: 'continuous', // Better for large books
  flow: 'paginated',
  snap: true,
  spreads: 'auto', // Optimize for screen size
};

// Chapter cleanup strategy
const MAX_LOADED_CHAPTERS = 5; // Keep only 5 chapters in memory
const chapterCache = new Map<string, ChapterContent>();

// AI response memory management
const MAX_CACHED_RESPONSES = 50; // Cache AI responses to avoid duplicate calls
const aiResponseCache = new Map<string, AIResponse>();

// Tool form memory management
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const formStateCleanup = () => {
  // Clean up abandoned form states
};
```

### Storage Optimization

```typescript
// OPFS storage patterns
const STORAGE_LIMITS = {
  maxFileSize: 100 * 1024 * 1024, // 100MB per book
  maxTotalStorage: 2 * 1024 * 1024 * 1024, // 2GB total
  compressionLevel: 6, // For cover images
  maxBooks: 1000, // Maximum number of books
};

// LocalStorage optimization
const LOCALSTORAGE_LIMITS = {
  maxSettingsSize: 5 * 1024 * 1024, // 5MB for settings
  maxReadingLocations: 1000, // Maximum reading locations to store
  compressionEnabled: true, // Compress large settings
};

// Cache management strategies
const CACHE_STRATEGIES = {
  bookMetadata: 'memory', // Cache in memory for fast access
  readingLocations: 'persistent', // Persist across sessions
  aiResponses: 'temporary', // Cache temporarily with TTL
  toolConfigs: 'persistent', // Persist tool configurations
};
```

### AI API Performance Optimization

```typescript
// AI request optimization
const AI_REQUEST_CONFIG = {
  timeout: 30000, // 30 seconds timeout
  retries: 2, // Retry failed requests
  debounceTime: 500, // Debounce rapid requests
  batchSize: 10, // Batch multiple requests when possible
  concurrentRequests: 3, // Maximum concurrent AI requests
};

// Response caching strategies
const AI_CACHE_CONFIG = {
  maxAge: 60 * 60 * 1000, // 1 hour cache
  maxSize: 100, // Maximum cached responses
  keyGenerator: (prompt: string, context: string) => `${prompt}:${context.substring(0, 100)}`, // Cache key generation
};

// Streaming response handling
const STREAMING_CONFIG = {
  chunkSize: 1024, // 1KB chunks for streaming
  maxChunks: 1000, // Maximum chunks per response
  processingDelay: 50, // Delay between chunk processing
};
```

## Security Configuration

### Content Security Policy

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  connect-src 'self' https://api.openai.com https://api.anthropic.com https://dict.eudic.net;
  frame-src https://dict.eudic.net;
  worker-src 'self';
  form-action 'self';
  base-uri 'self';
  frame-ancestors 'self';
"
/>
```

### API Key Storage

```typescript
// Encrypted storage for API keys
interface SecureStorageConfig {
  keyDerivation: 'PBKDF2';
  iterations: 100000;
  algorithm: 'AES-GCM';
  keyLength: 256;
  storage: 'localStorage'; // Store in localStorage with encryption
}

// API key security patterns
interface APIKeySecurity {
  encryption: {
    algorithm: 'AES-GCM';
    keyLength: 256;
    ivLength: 12;
    tagLength: 16;
  };
  validation: {
    keyFormat: RegExp; // Validate key format
    minLength: number;
    maxLength: number;
  };
  storage: {
    prefix: 'encrypted_'; // Prefix for encrypted keys
    expiration: number; // Key expiration in milliseconds
  };
}

// Secure API key management
const secureApiKeyStorage = {
  encrypt: (apiKey: string, password: string): Promise<string>,
  decrypt: (encryptedKey: string, password: string): Promise<string>,
  validate: (apiKey: string): boolean,
  rotate: (oldKey: string, newKey: string): Promise<void>,
};
```

### Input Validation and Sanitization

```typescript
// Input validation patterns
interface InputValidation {
  text: {
    maxLength: number;
    allowedCharacters: RegExp;
    sanitize: (input: string) => string;
  };
  urls: {
    allowedProtocols: ['https:', 'http:'];
    allowedDomains: string[];
    validate: (url: string) => boolean;
  };
  aiPrompts: {
    maxTokens: number;
    forbiddenPatterns: RegExp[];
    sanitize: (prompt: string) => string;
  };
}

// XSS prevention
const xssPrevention = {
  escapeHtml: (input: string) => string,
  sanitizeHtml: (html: string) => string,
  validateInput: (input: string) => boolean,
};
```

### AI API Security

```typescript
// AI API security configuration
interface AISecurityConfig {
  requestValidation: {
    maxPromptLength: number;
    maxContextLength: number;
    allowedContentTypes: string[];
  };
  responseValidation: {
    maxResponseLength: number;
    forbiddenContent: RegExp[];
    sanitizeResponse: (response: string) => string;
  };
  rateLimiting: {
    requestsPerMinute: number;
    requestsPerHour: number;
    burstLimit: number;
  };
  monitoring: {
    logRequests: boolean;
    logResponses: boolean;
    alertThresholds: {
      errorRate: number;
      latency: number;
    };
  };
}
```

## Development Workflow

### Code Quality Tools

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint --fix src/**/*.{ts,tsx}",
    "format": "prettier --write src/**/*.{ts,tsx,css,md}",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

### Git Hooks (Husky)

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check && npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md}": ["prettier --write"]
  }
}
```

## Deployment Strategy

### Static Site Hosting

- **Primary**: Netlify with automatic deployments
- **Alternative**: Vercel, GitHub Pages
- **Requirements**: HTTPS (required for OPFS), Custom headers for CORS

### PWA Manifest Configuration

```json
{
  "name": "EPUB Reader",
  "short_name": "EPUBReader",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#3B82F6",
  "background_color": "#FFFFFF",
  "categories": ["books", "education", "productivity"],
  "screenshots": [
    {
      "src": "screenshot-wide.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ]
}
```

## Testing Strategy

### Unit Testing

```typescript
// Vitest configuration
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
```

### E2E Testing

```typescript
// Playwright configuration for PWA testing
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    permissions: ['persistent-storage'], // For OPFS testing
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## Browser Compatibility Matrix

| Feature            | Chrome 86+ | Firefox 102+ | Safari 15.2+ | Edge 86+ |
| ------------------ | ---------- | ------------ | ------------ | -------- |
| OPFS               | ✅ Full    | ⚠️ Limited   | ⚠️ Partial   | ✅ Full  |
| File System Access | ✅         | ❌ Fallback  | ❌ Fallback  | ✅       |
| Service Worker     | ✅         | ✅           | ✅           | ✅       |
| PWA Install        | ✅         | ✅           | ✅           | ✅       |
| WebAssembly        | ✅         | ✅           | ✅           | ✅       |
| LocalStorage       | ✅         | ✅           | ✅           | ✅       |
| IndexedDB          | ✅         | ✅           | ✅           | ✅       |
| Fetch API          | ✅         | ✅           | ✅           | ✅       |
| Web Workers        | ✅         | ✅           | ✅           | ✅       |

### Fallback Strategies

- **OPFS Unavailable**: IndexedDB with File API for book storage
- **File System Access Unavailable**: Input file picker for uploads
- **Service Worker Issues**: Graceful degradation without offline features
- **LocalStorage Issues**: SessionStorage fallback or memory-only storage
- **IndexedDB Issues**: WebSQL fallback or memory-only storage
- **AI API Issues**: Local processing fallback or error messages
- **Dictionary API Issues**: Local dictionary or offline word definitions

### Feature Detection and Progressive Enhancement

```typescript
// Feature detection utilities
const featureDetection = {
  opfs: () => 'storage' in navigator && 'getDirectory' in navigator.storage,
  fileSystemAccess: () => 'showOpenFilePicker' in window,
  serviceWorker: () => 'serviceWorker' in navigator,
  webWorkers: () => typeof Worker !== 'undefined',
  localStorage: () => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  },
  indexedDB: () => 'indexedDB' in window,
};

// Progressive enhancement strategy
const progressiveEnhancement = {
  storage: () => {
    if (featureDetection.opfs()) return 'opfs';
    if (featureDetection.indexedDB()) return 'indexeddb';
    if (featureDetection.localStorage()) return 'localstorage';
    return 'memory';
  },
  fileUpload: () => {
    if (featureDetection.fileSystemAccess()) return 'filesystem';
    return 'input';
  },
  offline: () => {
    if (featureDetection.serviceWorker()) return 'serviceworker';
    return 'none';
  },
};
```
