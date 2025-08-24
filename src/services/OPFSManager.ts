import { v4 as uuidv4 } from 'uuid';
import { OPFSConfig, BookMetadata, OPFSDirectoryStructure } from '../types/book';
import { ContextMenuItem } from '../types/epub';
import * as EPUBMetadataService from './EPUBMetadataService';
import ePub, { Book } from 'epubjs';
import { getEpubValidationError, formatFileSize } from '../utils/epubValidation';
import {
  performFileOperation,
  safeGetDirectoryHandle,
  safeGetFileHandle,
} from '../utils/fileOperations';
import { DEFAULT_CONFIG } from '../constants/epub';

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

/**
 * Ensure config.json exists with default structure
 */
async function ensureConfigExists(): Promise<void> {
  const directoryStructure = await getDirectoryStructure();

  try {
    await directoryStructure.root.getFileHandle('config.json');
  } catch {
    // File doesn't exist, create it
    const config: OPFSConfig = {
      version: DEFAULT_CONFIG.CONFIG_VERSION,
      books: [],
      settings: {
        contextMenu: {
          api: '',
          key: '',
          items: [],
        },
      },
      lastSync: Date.now(),
    };

    await saveConfig(config);
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

  return (await performFileOperation(async () => {
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
  }, 'upload book')) as BookMetadata;
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

/**
 * Update context menu settings in config.json
 */
export async function updateContextMenuSettings(settings: {
  api: string;
  key: string;
  items: ContextMenuItem[];
}): Promise<void> {
  const config = await loadConfig();
  
  // Ensure settings structure exists
  if (!config.settings) {
    config.settings = { contextMenu: { api: '', key: '', items: [] } };
  }
  
  // Update context menu settings
  config.settings.contextMenu = {
    api: settings.api || '',
    key: settings.key || '',
    items: settings.items || [],
  };
  
  config.lastSync = Date.now();
  await saveConfig(config);
}

/**
 * Get context menu settings from config.json
 */
export async function getContextMenuSettings(): Promise<{
  api: string;
  key: string;
  items: ContextMenuItem[];
}> {
  const config = await loadConfig();
  const contextMenuSettings = config.settings?.contextMenu;
  
  // Return default values if contextMenu settings don't exist
  return {
    api: contextMenuSettings?.api || '',
    key: contextMenuSettings?.key || '',
    items: contextMenuSettings?.items || []
  };
}

let directoryStructure: OPFSDirectoryStructure | null = null;

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
      console.warn('Corrupted config.json detected, recreating...');
      const defaultConfig: OPFSConfig = {
        version: DEFAULT_CONFIG.CONFIG_VERSION,
        books: [],
        settings: {
          contextMenu: {
            api: '',
            key: '',
            items: [],
          },
        },
        lastSync: Date.now(),
      };
      await saveConfig(defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    // If file doesn't exist, create it
    if (error instanceof Error && error.message.includes('not found')) {
      const defaultConfig: OPFSConfig = {
        version: DEFAULT_CONFIG.CONFIG_VERSION,
        books: [],
        settings: {
          contextMenu: {
            api: '',
            key: '',
            items: [],
          },
        },
        lastSync: Date.now(),
      };
      await saveConfig(defaultConfig);
      return defaultConfig;
    }
    throw new Error(`Failed to load config: ${error}`);
  }
}
