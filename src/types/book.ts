import { ContextMenuSettings } from './epub';

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
  coverPath: string;
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
  /** Current status of the book in the library */
  status?: 'local' | 'downloading' | 'error';
  /** Download progress percentage for preset books */
  downloadProgress?: number;
  /** Whether the book was provisioned as a preset */
  isPreset?: boolean;
  /** Source URL for preset books */
  remoteUrl?: string;
  /** Error message when download fails */
  downloadError?: string;
}

/**
 * Typography settings
 */
export interface TypographySettings {
  /** Font family ID */
  fontFamily: string;
  /** Font size in percentage (e.g., 100) */
  fontSize: number;
}

/**
 * Application settings interface
 */
export interface AppSettings {
  /** Array of context menu settings */
  contextMenu: ContextMenuSettings;
  /** Typography settings */
  typography?: TypographySettings;
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
  /** Hash to file path index for O(1) duplicate detection */
  hashMapFilePath: Record<string, string>;
  /** Preset book tracking information */
  presetBooks?: PresetBookConfig[];
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
  /** Whether preset books have been initialized this session */
  presetBooksInitialized: boolean;
  /** Whether preset books are currently being checked/added as placeholders */
  isInitializingPresets: boolean;
  /** Number of active preset book downloads */
  downloadingCount: number;
}

/**
 * OPFS directory structure
 */
export interface OPFSDirectoryStructure {
  /** Root directory handle */
  root: FileSystemDirectoryHandle;
  /** Books directory handle */
  booksDir: FileSystemDirectoryHandle;
}

/**
 * Preset book configuration
 */
export interface PresetBookConfig {
  /** Remote URL of the preset EPUB file */
  url: string;
  /** SHA-256 hash once downloaded */
  fileHash?: string;
  /** Timestamp for hot-reload deletion */
  deletedAt?: number;
}
