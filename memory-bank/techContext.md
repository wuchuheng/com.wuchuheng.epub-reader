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

### Build & Development Tools

- **ESLint 9.11.1**: Code linting with TypeScript support
- **Prettier 3.3.3**: Code formatting
- **Autoprefixer 10.4.20**: CSS vendor prefixing

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

### Dictionary API (Eudic)

```typescript
interface EudicAPIConfig {
  baseUrl: 'https://dict.eudic.net/dicts/MiniDictSearch2';
  parameters: {
    word: string;
    context: string;
    platform: 'extension';
  };
  responseFormat: 'html'; // Embedded iframe content
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
```

### AI Provider APIs

#### OpenAI Integration

```typescript
interface OpenAIConfig {
  baseUrl: 'https://api.openai.com/v1';
  endpoints: {
    chat: '/chat/completions';
  };
  models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
  headers: {
    Authorization: 'Bearer ${apiKey}';
    'Content-Type': 'application/json';
  };
}
```

#### Anthropic Integration

```typescript
interface AnthropicConfig {
  baseUrl: 'https://api.anthropic.com/v1';
  endpoints: {
    messages: '/messages';
  };
  models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229'];
  headers: {
    'x-api-key': '${apiKey}';
    'anthropic-version': '2023-06-01';
    'Content-Type': 'application/json';
  };
}
```

## Performance Considerations

### Bundle Optimization

- **Code Splitting**: Lazy load pages and heavy dependencies
- **Tree Shaking**: Remove unused code via ES modules
- **Asset Optimization**: Compress images and fonts
- **Chunk Strategy**: Separate vendor, app, and EPUB processing code

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
};

// Chapter cleanup strategy
const MAX_LOADED_CHAPTERS = 5; // Keep only 5 chapters in memory
const chapterCache = new Map<string, ChapterContent>();
```

### Storage Optimization

```typescript
// OPFS storage patterns
const STORAGE_LIMITS = {
  maxFileSize: 100 * 1024 * 1024, // 100MB per book
  maxTotalStorage: 2 * 1024 * 1024 * 1024, // 2GB total
  compressionLevel: 6, // For cover images
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

### Fallback Strategies

- **OPFS Unavailable**: IndexedDB with File API
- **File System Access Unavailable**: Input file picker
- **Service Worker Issues**: Graceful degradation without offline features
