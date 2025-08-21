/**
 * EPUB metadata extracted from book files
 */
export interface EPUBMetaData {
  /** Book title from EPUB metadata */
  title?: string;
  /** Author(s) from EPUB metadata */
  author?: string;
  /** Description/summary from EPUB metadata */
  description?: string;
  /** Publisher information */
  publisher?: string;
  /** Publication date */
  publishedDate?: string;
  /** Language code */
  language?: string;
  /** ISBN if available */
  isbn?: string;
  /** Number of chapters/spine items */
  chapterCount?: number;
  /** Cover image path in OPFS */
  coverPath?: string;
}

/**
 * Book metadata interface for EPUB files
 */
export interface BookMetadata {
  /** Unique identifier for the book */
  id: string;
  /** Display name/title of the book */
  name: string;
  /** Path to the EPUB file in OPFS */
  path: string;
  /** Book author (optional) */
  author?: string;
  /** Path to cover image in OPFS (optional) */
  coverPath?: string;
  /** Creation timestamp */
  createdAt: number;
  /** Last read timestamp (optional) */
  lastRead?: number;
  /** Reading progress percentage 0-100 (optional) */
  progress?: number;
  /** Human-readable file size */
  size?: string;
  /** Total number of chapters */
  chapterCount?: number;
  /** Total number of pages */
  totalPages?: number;
  /** EPUB metadata extracted from the book file */
  metaData?: EPUBMetaData;
}

/**
 * Application settings interface
 */
export interface AppSettings {
  /** Theme preference */
  theme: 'light' | 'dark';
  /** Font size preference */
  fontSize: 'small' | 'medium' | 'large';
  /** AI provider configuration */
  aiProvider?: {
    type: 'openai' | 'anthropic' | 'custom';
    apiKey?: string;
    baseUrl?: string;
  };
  /** Dictionary provider configuration */
  dictionaryProvider?: {
    enabled: boolean;
  };
}

/**
 * OPFS configuration structure
 */
export interface OPFSConfig {
  /** Configuration version for migrations */
  version: 1;
  /** Array of book metadata */
  books: BookMetadata[];
  /** Application settings */
  settings: AppSettings;
  /** Last sync timestamp */
  lastSync: number;
}

/**
 * Upload progress state
 */
export interface UploadProgress {
  /** Current upload progress 0-100 */
  progress: number;
  /** Current file being uploaded */
  fileName: string;
  /** Upload status */
  status: 'uploading' | 'processing' | 'complete' | 'error';
  /** Error message if status is 'error' */
  error?: string;
}

/**
 * Bookshelf state for Redux
 */
export interface BookshelfState {
  /** Array of books in the library */
  books: BookMetadata[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Upload progress */
  uploadProgress: UploadProgress | null;
}

/**
 * OPFS directory structure
 */
export interface OPFSDirectoryStructure {
  /** Root directory handle */
  root: FileSystemDirectoryHandle;
  /** Books directory handle */
  booksDir: FileSystemDirectoryHandle;
  /** Covers directory handle */
  coversDir: FileSystemDirectoryHandle;
}
