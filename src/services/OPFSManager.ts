import { v4 as uuidv4 } from 'uuid';
import { OPFSConfig, BookMetadata, OPFSDirectoryStructure } from '../types/book';
import * as EPUBMetadataService from './EPUBMetadataService';
import ePub, { Book } from 'epubjs';

/**
 * Check if OPFS is supported in the current browser
 */
export function isSupported(): boolean {
  return 'storage' in navigator && 'getDirectory' in navigator.storage;
}

/**
 * Initialize OPFS directory structure
 */
export async function initialize(): Promise<void> {
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
  } catch (error) {
    throw new Error(`Failed to initialize OPFS: ${error}`);
  }
}

/**
 * Ensure config.json exists with default structure
 */
async function ensureConfigExists(): Promise<void> {
  if (!directoryStructure) {
    throw new Error('OPFS not initialized');
  }

  try {
    await directoryStructure.root.getFileHandle('config.json');
  } catch {
    // File doesn't exist, create it
    const config: OPFSConfig = {
      version: 1,
      books: [],
      settings: {
        theme: 'light',
        fontSize: 'medium',
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
  if (!directoryStructure) {
    throw new Error('OPFS not initialized');
  }

  // Validate file type
  if (!file.name.toLowerCase().endsWith('.epub')) {
    throw new Error('Only EPUB files are supported');
  }

  // Validate file size (100MB limit)
  if (file.size > 100 * 1024 * 1024) {
    throw new Error('File size exceeds 100MB limit');
  }

  const bookId = uuidv4();
  const bookFileName = file.name;
  const bookDirName = bookId;
  const bookPath = `books/${bookDirName}/${bookFileName}`;

  try {
    // Create book directory
    const bookDir = await directoryStructure.booksDir.getDirectoryHandle(bookDirName, {
      create: true,
    });

    // Save the EPUB file
    const bookFileHandle = await bookDir.getFileHandle(bookFileName, { create: true });
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
        const coverFileHandle = await bookDir.getFileHandle(coverFileName, { create: true });
        const coverWritable = await coverFileHandle.createWritable();
        await coverWritable.write(await coverBlob.arrayBuffer());
        await coverWritable.close();

        coverPath = `books/${bookDirName}/${coverFileName}`;
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
  } catch (error) {
    throw new Error(`Failed to upload book: ${error}`);
  }
}

/**
 * Save configuration to config.json
 */
async function saveConfig(config: OPFSConfig): Promise<void> {
  if (!directoryStructure) {
    throw new Error('OPFS not initialized');
  }

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
  if (!directoryStructure) {
    throw new Error('OPFS not initialized');
  }

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
  if (!directoryStructure) {
    throw new Error('OPFS not initialized');
  }

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
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

let directoryStructure: OPFSDirectoryStructure | null = null;

/**
 * Load configuration from config.json with error recovery
 */
async function loadConfig(): Promise<OPFSConfig> {
  if (!directoryStructure) {
    throw new Error('OPFS not initialized');
  }

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
        version: 1,
        books: [],
        settings: {
          theme: 'light',
          fontSize: 'medium',
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
        version: 1,
        books: [],
        settings: {
          theme: 'light',
          fontSize: 'medium',
        },
        lastSync: Date.now(),
      };
      await saveConfig(defaultConfig);
      return defaultConfig;
    }
    throw new Error(`Failed to load config: ${error}`);
  }
}
