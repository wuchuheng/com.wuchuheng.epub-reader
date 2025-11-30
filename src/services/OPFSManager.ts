import { v4 as uuidv4 } from 'uuid';
import { OPFSConfig, BookMetadata, OPFSDirectoryStructure } from '../types/book';
import { ContextMenuItem, ContextMenuSettings } from '../types/epub';
import * as EPUBMetadataService from './EPUBMetadataService';
import ePub, { Book } from 'epubjs';
import { getEpubValidationError, formatFileSize } from '../utils/epubValidation';
import {
  performFileOperation,
  safeGetDirectoryHandle,
  safeGetFileHandle,
} from '../utils/fileOperations';
import { DEFAULT_CONFIG } from '../constants/epub';
import { menuItemDefaultConfig } from '@/config/config';

let directoryStructure: OPFSDirectoryStructure | null = null;

export type OPFSStorageEntry = {
  path: string;
  size: number;
  kind: 'file' | 'directory';
};

export type OPFSStorageStats = {
  totalBytes: number;
  entries: OPFSStorageEntry[];
};

/**
 * Check if OPFS is supported in the current browser
 */
export function isSupported(): boolean {
  return 'storage' in navigator && 'getDirectory' in navigator.storage;
}

/**
 * Initialize OPFS directory structure
 */
export async function initialize(): Promise<OPFSDirectoryStructure> {
  if (!isSupported()) {
    throw new Error('OPFS is not supported in this browser');
  }

  try {
    const root = await navigator.storage.getDirectory();

    // Create books directory
    const booksDir = await root.getDirectoryHandle('books', { create: true });

    directoryStructure = {
      root,
      booksDir,
    };

    // Ensure config.json exists
    await ensureConfigExists();
    return directoryStructure;
  } catch (error) {
    throw new Error(`Failed to initialize OPFS: ${error}`);
  }
}

const getDirectoryStructure = async (): Promise<OPFSDirectoryStructure> => {
  if (!directoryStructure) {
    return await initialize();
  }
  return directoryStructure!;
};

const applyMenuItemDefaults = (items: ContextMenuItem[]): ContextMenuItem[] =>
  items.map((item) => {
    const { defaultFor: _legacyDefault, ...rest } = item as ContextMenuItem & {
      defaultFor?: unknown;
    };
    const isEnabled = item.enabled ?? true;
    const supportsSingleWord = item.supportsSingleWord !== false;
    const supportsMultiWord = item.supportsMultiWord !== false;
    const normalizedSupports =
      !supportsSingleWord && !supportsMultiWord
        ? { supportsSingleWord: true, supportsMultiWord: false }
        : { supportsSingleWord, supportsMultiWord };

    return {
      ...rest,
      enabled: isEnabled,
      ...normalizedSupports,
    };
  });

const buildDefaultContextMenuSettings = (): ContextMenuSettings => ({
  api: '',
  key: '',
  defaultModel: '',
  pinnedMaximized: false,
  items: applyMenuItemDefaults(menuItemDefaultConfig),
  providerId: 'custom',
  providerApiKeyCache: {},
  providerDefaultModelCache: {},
});

const buildDefaultConfig = (books: BookMetadata[] = []): OPFSConfig => ({
  version: DEFAULT_CONFIG.CONFIG_VERSION,
  books,
  settings: {
    contextMenu: buildDefaultContextMenuSettings(),
  },
  lastSync: Date.now(),
});

/**
 * Ensure config.json exists with default structure
 */
async function ensureConfigExists(): Promise<void> {
  const directoryStructure = await getDirectoryStructure();

  try {
    await directoryStructure.root.getFileHandle('config.json');
  } catch {
    // File doesn't exist, create it
    await saveConfig(buildDefaultConfig());
  }
}

/**
 * Upload and save an EPUB book with metadata extraction and cover image
 */
export async function uploadBook(file: File): Promise<BookMetadata> {
  const directoryStructure = await getDirectoryStructure();

  // Validate file using centralized validation
  const validationError = getEpubValidationError(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const bookId = uuidv4();
  const bookFileName = file.name;
  const bookDirName = bookId;
  const bookPath = `books/${bookDirName}/${bookFileName}`;

  const result = await performFileOperation<BookMetadata>(async () => {
    // Create book directory
    const bookDir = await safeGetDirectoryHandle(
      () => directoryStructure.booksDir.getDirectoryHandle(bookDirName, { create: true }),
      bookDirName
    );

    if (!bookDir) {
      throw new Error('Failed to create book directory');
    }

    // Save the EPUB file
    const bookFileHandle = await safeGetFileHandle(
      () => bookDir.getFileHandle(bookFileName, { create: true }),
      bookFileName
    );

    if (!bookFileHandle) {
      throw new Error('Failed to create book file');
    }

    const writable = await bookFileHandle.createWritable();
    await writable.write(await file.arrayBuffer());
    await writable.close();

    // Load EPUB for cover extraction
    const arrayBuffer = await file.arrayBuffer();
    const book: Book = ePub(arrayBuffer);

    // Extract EPUB metadata
    const epubMetadata = await EPUBMetadataService.extractMetadata(file);

    // Extract and save cover image
    let coverPath: string = '';
    try {
      const coverBlob = await EPUBMetadataService.extractCoverBlob(book);
      const coverFormat = (await EPUBMetadataService.getCoverFormat(book)) || 'jpg';

      if (coverBlob) {
        const coverFileName = `cover.${coverFormat}`;
        const coverFileHandle = await safeGetFileHandle(
          () => bookDir.getFileHandle(coverFileName, { create: true }),
          coverFileName
        );

        if (coverFileHandle) {
          const coverWritable = await coverFileHandle.createWritable();
          await coverWritable.write(await coverBlob.arrayBuffer());
          await coverWritable.close();
          coverPath = `books/${bookDirName}/${coverFileName}`;
        }
      }
    } catch (error) {
      console.warn('Failed to extract cover image:', error);
    }

    // Create enhanced book metadata
    const bookMetadata: BookMetadata = {
      id: bookId,
      name: epubMetadata.title || file.name.replace(/\.epub$/i, ''),
      author: epubMetadata.author || 'Unknown Author',
      path: bookPath,
      createdAt: Date.now(),
      size: formatFileSize(file.size),
      chapterCount: epubMetadata.chapterCount || 0,
      coverPath,
      metaData: epubMetadata,
    };

    // Update config with new book
    const config = await loadConfig();
    config.books.push(bookMetadata);
    config.lastSync = Date.now();
    await saveConfig(config);

    return bookMetadata;
  }, 'upload book');

  return result.data!;
}

/**
 * Save configuration to config.json
 */
export async function saveConfig(config: OPFSConfig): Promise<void> {
  const directoryStructure = await getDirectoryStructure();

  try {
    const fileHandle = await directoryStructure.root.getFileHandle('config.json', {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(config, null, 2));
    await writable.close();
  } catch (error) {
    throw new Error(`Failed to save config: ${error}`);
  }
}

/**
 * Delete a book and its directory
 */
export async function deleteBook(bookId: string): Promise<void> {
  const directoryStructure = await getDirectoryStructure();

  try {
    // Remove entire book directory
    try {
      await directoryStructure.booksDir.removeEntry(bookId, { recursive: true });
    } catch {
      // Directory might not exist, ignore
    }

    // Update config
    const config = await loadConfig();
    config.books = config.books.filter((book) => book.id !== bookId);
    config.lastSync = Date.now();
    await saveConfig(config);
  } catch (error) {
    throw new Error(`Failed to delete book: ${error}`);
  }
}

/**
 * Get book file as ArrayBuffer
 */
export async function getBookFile(bookId: string): Promise<ArrayBuffer> {
  const directoryStructure = await getDirectoryStructure();

  try {
    // Get book directory and find the epub file
    const bookDir = await directoryStructure.booksDir.getDirectoryHandle(bookId);

    // Find the epub file in the directory
    for await (const [name, handle] of bookDir.entries()) {
      if (name.toLowerCase().endsWith('.epub')) {
        const file = await (handle as FileSystemFileHandle).getFile();
        return await file.arrayBuffer();
      }
    }

    throw new Error('EPUB file not found in book directory');
  } catch (error) {
    throw new Error(`Failed to get book file: ${error}`);
  }
}

/**
 * Access cover image as Base64 string from OPFS
 * @param coverPath The path to the cover image, like: books/123/cover.jpg
 */
export const getCoverBase64ByPath = async (coverPath: string): Promise<string | undefined> => {
  // 2. Handle fetching and converting the cover image
  try {
    const root = await navigator.storage.getDirectory();

    // Split the path into parts
    const pathParts = coverPath.split('/');

    // Navigate through directories
    let currentDir = root;
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentDir = await currentDir.getDirectoryHandle(pathParts[i]);
    }

    // Get the file from the final directory
    const fileName = pathParts[pathParts.length - 1];
    const fileHandle = await currentDir.getFileHandle(fileName);

    const file = await fileHandle.getFile();
    // 2.2 Convert to Base64
    const reader = new FileReader();

    // 2.3 Return Base64 string
    return new Promise((resolve) => {
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
    });
  } catch (error) {
    console.error('Error fetching cover image:', error);
    return undefined;
  }
};

/**
 * Get all books from config
 */
export async function getAllBooks(): Promise<BookMetadata[]> {
  const config = await loadConfig();
  return config.books;
}

const collectEntries = async (
  directory: FileSystemDirectoryHandle,
  prefix: string = ''
): Promise<OPFSStorageEntry[]> => {
  const entries: OPFSStorageEntry[] = [];

  for await (const [name, handle] of directory.entries()) {
    const path = prefix ? `${prefix}/${name}` : name;

    if (handle.kind === 'file') {
      try {
        const fileHandle = handle as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        entries.push({ path, size: file.size, kind: 'file' });
      } catch (error) {
        console.warn(`Failed to read file size for ${path}`, error);
      }
    } else {
      entries.push({ path, size: 0, kind: 'directory' });
      try {
        const childEntries = await collectEntries(handle as FileSystemDirectoryHandle, path);
        entries.push(...childEntries);
      } catch (error) {
        console.warn(`Failed to read directory ${path}`, error);
      }
    }
  }

  return entries;
};

/**
 * Return a list of OPFS files with their sizes and a total.
 */
export async function getStorageStats(): Promise<OPFSStorageStats> {
  const directoryStructure = await getDirectoryStructure();
  const entries = await collectEntries(directoryStructure.root);
  const totalBytes = entries
    .filter((entry) => entry.kind === 'file')
    .reduce((sum, entry) => sum + entry.size, 0);

  return { totalBytes, entries };
}

/**
 * Remove all stored data: books directory and config file, then recreate defaults.
 */
export async function resetAllData(): Promise<void> {
  if (!isSupported()) {
    throw new Error('OPFS is not supported in this browser');
  }

  const structure = await getDirectoryStructure();

  try {
    await structure.root.removeEntry('books', { recursive: true });
  } catch (error) {
    console.warn('Failed to remove books directory during reset:', error);
  }

  try {
    await structure.root.removeEntry('config.json');
  } catch (error) {
    console.warn('Failed to remove config during reset:', error);
  }

  directoryStructure = null;
  await initialize();
}

/**
 * Update context menu settings in config.json
 */
export async function updateContextMenuSettings(settings: Partial<ContextMenuSettings>): Promise<void> {
  const config = await loadConfig();
  const defaults = buildDefaultContextMenuSettings();

  // Ensure settings structure exists
  if (!config.settings) {
    config.settings = { 
      contextMenu: defaults,
    };
  }

  // Update context menu settings
  // Merge existing with new
  const mergedItems =
    settings.items ?? config.settings.contextMenu.items ?? defaults.items;
  config.settings.contextMenu = {
    ...defaults,
    ...config.settings.contextMenu,
    ...settings,
    // Ensure required fields are at least present if they were missing in partial
    api: settings.api ?? config.settings.contextMenu.api ?? defaults.api,
    key: settings.key ?? config.settings.contextMenu.key ?? defaults.key,
    defaultModel: settings.defaultModel ?? config.settings.contextMenu.defaultModel ?? defaults.defaultModel,
    pinnedMaximized:
      settings.pinnedMaximized ??
      config.settings.contextMenu.pinnedMaximized ??
      defaults.pinnedMaximized,
    items: applyMenuItemDefaults(mergedItems),
    providerApiKeyCache:
      settings.providerApiKeyCache ??
      config.settings.contextMenu.providerApiKeyCache ??
      defaults.providerApiKeyCache,
    providerDefaultModelCache:
      settings.providerDefaultModelCache ??
      config.settings.contextMenu.providerDefaultModelCache ??
      defaults.providerDefaultModelCache,
  };

  config.lastSync = Date.now();
  await saveConfig(config);
}

/**
 * Get context menu settings from config.json
 */
export async function getContextMenuSettings(): Promise<ContextMenuSettings> {
  const config = await loadConfig();
  const defaults = buildDefaultContextMenuSettings();
  const contextMenuSettings = config.settings?.contextMenu;

  // Return default values if contextMenu settings don't exist
  const items = applyMenuItemDefaults(contextMenuSettings?.items ?? defaults.items);

  return {
    ...defaults,
    ...contextMenuSettings,
    api: contextMenuSettings?.api ?? defaults.api,
    key: contextMenuSettings?.key ?? defaults.key,
    defaultModel: contextMenuSettings?.defaultModel ?? defaults.defaultModel,
    providerId: contextMenuSettings?.providerId ?? defaults.providerId,
    providerApiKeyCache: contextMenuSettings?.providerApiKeyCache ?? defaults.providerApiKeyCache,
    providerDefaultModelCache:
      contextMenuSettings?.providerDefaultModelCache ?? defaults.providerDefaultModelCache,
    pinnedMaximized: contextMenuSettings?.pinnedMaximized ?? defaults.pinnedMaximized,
    items,
  };
}

/**
 * Load configuration from config.json with error recovery
 */
export async function loadConfig(): Promise<OPFSConfig> {
  const directoryStructure = await getDirectoryStructure();

  try {
    const fileHandle = await directoryStructure.root.getFileHandle('config.json');
    const file = await fileHandle.getFile();
    const content = await file.text();

    // Handle empty or corrupted files
    if (!content.trim()) {
      throw new Error('Config file is empty');
    }

    try {
      return JSON.parse(content);
    } catch {
      // If JSON is corrupted, recreate with default config
      const defaultConfig = buildDefaultConfig();

      await saveConfig(defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    // If file doesn't exist, create it
    if (error instanceof Error && error.message.includes('not found')) {
      const defaultConfig = buildDefaultConfig();
      await saveConfig(defaultConfig);
      return defaultConfig;
    }
    throw new Error(`Failed to load config: ${error}`);
  }
}
