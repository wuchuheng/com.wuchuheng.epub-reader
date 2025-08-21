import { Book, Rendition } from 'epubjs';

/**
 * EPUB.js type extensions and application-specific types
 */

// Table of Contents item structure
export interface TocItem {
  href: string;
  label: string;
  subitems?: TocItem[];
}

// EPUB location structure from rendition events
export interface EpubLocation {
  start: {
    href: string;
    displayed?: {
      page?: number;
    };
  };
  atStart?: boolean;
  atEnd?: boolean;
}

// Navigation chapter structure
export interface Chapter {
  id: string;
  href: string;
  label: string;
  level: number;
  children?: Chapter[];
}

// Book metadata structure
export interface EpubMetadata {
  title?: string;
  author?: string;
  language?: string;
  identifier?: string;
  publisher?: string;
  description?: string;
  published?: string;
  rights?: string;
  subject?: string[];
}

// Reading progress state
export interface ReadingProgress {
  currentPage: number;
  totalPages: number;
  currentChapter: string | null;
  percentage: number;
  isAtStart: boolean;
  isAtEnd: boolean;
}

// Book state for hooks
export interface BookState {
  book: Book | null;
  rendition: Rendition | null;
  isLoading: boolean;
  error: string | null;
}

// Navigation state
export interface NavigationState {
  tableOfContents: TocItem[];
  currentLocation: string | null;
  currentChapter: string | null;
  currentPage: number;
  totalPages: number;
  isAtStart: boolean;
  isAtEnd: boolean;
}

// Rendition options for consistent configuration
export interface RenditionConfig {
  width: string;
  height: string;
  spread: 'auto' | 'none' | 'always';
  minSpreadWidth: number;
  allowScriptedContent?: boolean;
  manager?: 'default' | 'continuous';
  flow?: 'paginated' | 'scrolled-doc' | 'scrolled-continuous';
}

// Hook return types
export interface BookLoaderResult {
  book: Book | null;
  isLoading: boolean;
  error: string | null;
}

export interface BookRenditionResult {
  containerRef: React.RefObject<HTMLDivElement>;
  rendition: Rendition | null;
  currentLocation: string | null;
  isReady: boolean;
}

export interface BookNavigationResult {
  tableOfContents: TocItem[];
  currentPage: number;
  totalPages: number;
  currentChapter: string | null;
  isAtStart: boolean;
  isAtEnd: boolean;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToChapter: (href: string) => void;
  goToPage: (page: number) => void;
  goToPercentage: (percentage: number) => void;
}

// EPUB.js location utilities
export interface LocationUtils {
  cfiFromPage: (page: number) => string;
  pageFromCfi: (cfi: string) => number;
  percentageFromCfi: (cfi: string) => number;
  cfiFromPercentage: (percentage: number) => string;
}

// Storage keys for persistence
export interface StorageKeys {
  readingPosition: (bookId: string) => string;
  settings: string;
  bookmarks: (bookId: string) => string;
  highlights: (bookId: string) => string;
}

// Error types
export interface EpubError {
  type: 'LOAD_ERROR' | 'PARSE_ERROR' | 'RENDER_ERROR' | 'NAVIGATION_ERROR';
  message: string;
  details?: any;
}

// Configuration types
export interface ReaderConfig {
  fontSize: number;
  fontFamily: string;
  theme: 'light' | 'dark' | 'sepia';
  lineHeight: number;
  margin: number;
  spread: boolean;
  direction: 'ltr' | 'rtl';
}

// Event types for EPUB.js
export interface EpubEvents {
  relocated: (location: EpubLocation) => void;
  rendered: (section: any) => void;
  selected: (cfiRange: string, contents: any) => void;
  keyup: (event: KeyboardEvent) => void;
}

// Hook configuration
export interface HookConfig {
  bookId: string;
  autoSavePosition?: boolean;
  enableKeyboardNavigation?: boolean;
  enableTouchNavigation?: boolean;
  enableTextSelection?: boolean;
}
