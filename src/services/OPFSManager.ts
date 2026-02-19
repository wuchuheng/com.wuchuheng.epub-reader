import {
  OPFSConfig,
  BookMetadata,
  OPFSDirectoryStructure,
  TypographySettings,
} from '../types/book';
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

export type OPFSDirectoryEntry = {
  name: string;
  path: string;
  kind: 'file' | 'directory';
  size?: number;
};

export type OPFSStorageStats = {
  totalBytes: number;
  entries: OPFSStorageEntry[];
};

/**
 * Get a file from OPFS by its relative path.
 */
export async function getFileByPath(path: string): Promise<File> {
  const normalizedPath = path.trim();

  if (!normalizedPath) {
    throw new Error('File path is required');
  }

  const directoryStructure = await getDirectoryStructure();
  const pathParts = normalizedPath.split('/').filter(Boolean);

  if (pathParts.length === 0) {
    throw new Error('Invalid file path');
  }

  let currentDir = directoryStructure.root;
  for (let index = 0; index < pathParts.length - 1; index += 1) {
    currentDir = await currentDir.getDirectoryHandle(pathParts[index]);
  }

  const fileName = pathParts[pathParts.length - 1];
  const fileHandle = await currentDir.getFileHandle(fileName);
  return await fileHandle.getFile();
}

/**
 * List entries for a specific directory without recursive traversal.
 */
export async function listDirectoryEntries(path: string = ''): Promise<OPFSDirectoryEntry[]> {
  const normalizedPath = path.trim();
  const directoryStructure = await getDirectoryStructure();
  const pathParts = normalizedPath ? normalizedPath.split('/').filter(Boolean) : [];

  let currentDir = directoryStructure.root;
  for (const part of pathParts) {
    currentDir = await currentDir.getDirectoryHandle(part);
  }

  const entries: OPFSDirectoryEntry[] = [];
  for await (const [name, handle] of currentDir.entries()) {
    const entryPath = normalizedPath ? `${normalizedPath}/${name}` : name;

    if (handle.kind === 'directory') {
      entries.push({ name, path: entryPath, kind: 'directory' });
      continue;
    }

    try {
      const fileHandle = handle as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      entries.push({ name, path: entryPath, kind: 'file', size: file.size });
    } catch (error) {
      console.warn(`Failed to read file ${entryPath}`, error);
    }
  }

  return entries;
}

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
  maxConcurrentRequests: DEFAULT_CONFIG.DEFAULT_MAX_CONCURRENT_REQUESTS,
  items: applyMenuItemDefaults(menuItemDefaultConfig),
  providerId: 'custom',
  providerApiKeyCache: {},
  providerDefaultModelCache: {},
});

const buildDefaultTypographySettings = (): TypographySettings => ({
  fontFamily: 'system',
  fontSize: 100,
});

const buildDefaultConfig = (books: BookMetadata[] = []): OPFSConfig => ({
  version: DEFAULT_CONFIG.CONFIG_VERSION,
  books,
  settings: {
    contextMenu: buildDefaultContextMenuSettings(),
    typography: buildDefaultTypographySettings(),
  },
  hashMapFilePath: {},
  lastSync: Date.now(),
});

const applyConfigDefaults = (config: Partial<OPFSConfig>): OPFSConfig => {
  const defaults = buildDefaultConfig();
  const contextMenuSettings = config.settings?.contextMenu
    ? {
        ...defaults.settings.contextMenu,
        ...config.settings.contextMenu,
        items: applyMenuItemDefaults(
          config.settings.contextMenu.items ?? defaults.settings.contextMenu.items
        ),
      }
    : defaults.settings.contextMenu;

  const typographySettings = config.settings?.typography
    ? {
        ...defaults.settings.typography,
        ...config.settings.typography,
      }
    : defaults.settings.typography!;

  return {
    version: DEFAULT_CONFIG.CONFIG_VERSION,
    books: config.books ?? [],
    settings: { contextMenu: contextMenuSettings, typography: typographySettings },
    lastSync: config.lastSync ?? Date.now(),
    hashMapFilePath: config.hashMapFilePath ?? {},
  };
};

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

export const toArrayBuffer = (data: ArrayBuffer | ArrayBufferView): ArrayBuffer => {
  if (data instanceof ArrayBuffer) {
    return data;
  }

  if (data.buffer instanceof ArrayBuffer) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  }

  const view = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const copy = new Uint8Array(view.byteLength);
  copy.set(view);

  return copy.buffer;
};

export const calculateFileHash = async (data: ArrayBuffer | ArrayBufferView): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', toArrayBuffer(data));

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const createBookDirectory = async (
  structure: OPFSDirectoryStructure,
  bookDirName: string
): Promise<FileSystemDirectoryHandle> => {
  const bookDir = await safeGetDirectoryHandle(
    () => structure.booksDir.getDirectoryHandle(bookDirName, { create: true }),
    bookDirName
  );

  if (!bookDir) {
    throw new Error('Failed to create book directory');
  }

  return bookDir;
};

const saveEpubFile = async (
  bookDir: FileSystemDirectoryHandle,
  fileName: string,
  buffer: ArrayBuffer
): Promise<void> => {
  const bookFileHandle = await safeGetFileHandle(
    () => bookDir.getFileHandle(fileName, { create: true }),
    fileName
  );

  if (!bookFileHandle) {
    throw new Error('Failed to create book file');
  }

  const writable = await bookFileHandle.createWritable();
  await writable.write(buffer);
  await writable.close();
};

const saveCoverImage = async (
  bookDir: FileSystemDirectoryHandle,
  bookDirName: string,
  bookInstance: Book
): Promise<string> => {
  try {
    const coverBlob = await EPUBMetadataService.extractCoverBlob(bookInstance);
    const coverFormat = (await EPUBMetadataService.getCoverFormat(bookInstance)) || 'jpg';

    if (!coverBlob) {
      return '';
    }

    const coverFileName = `cover.${coverFormat}`;
    const coverFileHandle = await safeGetFileHandle(
      () => bookDir.getFileHandle(coverFileName, { create: true }),
      coverFileName
    );

    if (!coverFileHandle) {
      return '';
    }

    const coverWritable = await coverFileHandle.createWritable();
    await coverWritable.write(await coverBlob.arrayBuffer());
    await coverWritable.close();

    return `books/${bookDirName}/${coverFileName}`;
  } catch (error) {
    console.warn('Failed to extract cover image:', error);
    return '';
  }
};

const persistBookMetadata = async (bookMetadata: BookMetadata): Promise<void> => {
  const config = await loadConfig();
  config.books.push(bookMetadata);
  config.hashMapFilePath[bookMetadata.id] = bookMetadata.path;
  config.lastSync = Date.now();
  await saveConfig(config);
};

/**
 * Upload and save an EPUB book with metadata extraction and cover image
 */
export async function uploadBook(file: File): Promise<BookMetadata> {
  const validationError = getEpubValidationError(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const fileBuffer = await file.arrayBuffer();
  const fileHash = await calculateFileHash(fileBuffer);
  const isDuplicate = await checkFileHashExists(fileHash);

  if (isDuplicate) {
    throw new Error('Book already exists');
  }

  return uploadBookWithHash(file, fileHash, fileBuffer);
}

export async function uploadBookWithHash(
  file: File,
  fileHash: string,
  fileBuffer?: ArrayBuffer,
  options?: { isPreset?: boolean; remoteUrl?: string }
): Promise<BookMetadata> {
  const directoryStructure = await getDirectoryStructure();
  const validationError = getEpubValidationError(file);

  // 1. Input validation
  if (validationError) {
    throw new Error(validationError);
  }

  // 2. Core processing - save file and extract metadata
  const buffer = fileBuffer ?? (await file.arrayBuffer());
  const bookFileName = file.name;
  const bookDirName = fileHash;
  const bookPath = `books/${bookDirName}/${bookFileName}`;

  const result = await performFileOperation<BookMetadata>(async () => {
    const bookDir = await createBookDirectory(directoryStructure, bookDirName);
    await saveEpubFile(bookDir, bookFileName, buffer);

    const bookInstance: Book = ePub(buffer);
    const epubMetadata = await EPUBMetadataService.extractMetadata(file);
    const coverPath = await saveCoverImage(bookDir, bookDirName, bookInstance);

    const bookMetadata: BookMetadata = {
      id: fileHash,
      hash: fileHash,
      name: epubMetadata.title || file.name.replace(/\.epub$/i, ''),
      author: epubMetadata.author || 'Unknown Author',
      path: bookPath,
      createdAt: Date.now(),
      size: formatFileSize(file.size),
      chapterCount: epubMetadata.chapterCount || 0,
      coverPath,
      metaData: epubMetadata,
      status: 'local',
      isPreset: options?.isPreset,
      remoteUrl: options?.remoteUrl,
    };

    await persistBookMetadata(bookMetadata);

    return bookMetadata;
  }, 'upload book with hash');

  // 3. Output handling
  if (!result.success || !result.data) {
    throw new Error(result.error ?? 'Failed to upload book');
  }

  return result.data;
}

export async function checkFileHashExists(hash: string): Promise<boolean> {
  const config = await loadConfig();
  return Boolean(config.hashMapFilePath?.[hash]);
}

/**
 * Save configuration to config.json
 */
export async function saveConfig(config: OPFSConfig): Promise<void> {
  const directoryStructure = await getDirectoryStructure();
  const normalizedConfig = applyConfigDefaults(config);

  try {
    const fileHandle = await directoryStructure.root.getFileHandle('config.json', {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(normalizedConfig, null, 2));
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
    if (config.hashMapFilePath?.[bookId]) {
      delete config.hashMapFilePath[bookId];
    }
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
  return config.books.map((book) => ({
    ...book,
    status: book.status ?? 'local',
    downloadProgress:
      book.status === 'downloading' ? book.downloadProgress ?? 0 : book.downloadProgress,
  }));
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
    maxConcurrentRequests:
      settings.maxConcurrentRequests ??
      config.settings.contextMenu.maxConcurrentRequests ??
      defaults.maxConcurrentRequests,
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
    maxConcurrentRequests: contextMenuSettings?.maxConcurrentRequests ?? defaults.maxConcurrentRequests,
    items,
  };
}

/**
 * Get typography settings from config.json
 */
export async function getTypographySettings(): Promise<TypographySettings> {
  const config = await loadConfig();
  const defaults = buildDefaultTypographySettings();
  return {
    ...defaults,
    ...config.settings?.typography,
  };
}

/**
 * Update typography settings in config.json
 */
export async function updateTypographySettings(settings: Partial<TypographySettings>): Promise<void> {
  const config = await loadConfig();
  if (!config.settings) {
    config.settings = {
      contextMenu: buildDefaultContextMenuSettings(),
      typography: buildDefaultTypographySettings(),
    };
  }
  config.settings.typography = {
    ...buildDefaultTypographySettings(),
    ...config.settings.typography,
    ...settings,
  };
  config.lastSync = Date.now();
  await saveConfig(config);
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

    if (!content.trim()) {
      const defaultConfig = buildDefaultConfig();
      await saveConfig(defaultConfig);
      return defaultConfig;
    }

    try {
      const parsed = JSON.parse(content) as Partial<OPFSConfig>;
      const normalized = applyConfigDefaults(parsed);

      if (
        !parsed.hashMapFilePath ||
        !parsed.settings?.contextMenu ||
        parsed.books !== normalized.books
      ) {
        await saveConfig(normalized);
      }

      return normalized;
    } catch {
      const defaultConfig = buildDefaultConfig();
      await saveConfig(defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      const defaultConfig = buildDefaultConfig();
      await saveConfig(defaultConfig);
      return defaultConfig;
    }
    throw new Error(`Failed to load config: ${error}`);
  }
}
