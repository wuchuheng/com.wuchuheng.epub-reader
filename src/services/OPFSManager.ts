import { v4 as uuidv4 } from 'uuid';
import { OPFSConfig, BookMetadata, OPFSDirectoryStructure } from '../types/book';
import { EPUBMetadataService } from './EPUBMetadataService';

/**
 * Service for managing OPFS (Origin Private File System) operations
 * Handles all file storage and retrieval for EPUB books
 */
export class OPFSManager {
  private static instance: OPFSManager;
  private directoryStructure: OPFSDirectoryStructure | null = null;

  /**
   * Get singleton instance of OPFSManager
   */
  public static getInstance(): OPFSManager {
    if (!OPFSManager.instance) {
      OPFSManager.instance = new OPFSManager();
    }
    return OPFSManager.instance;
  }

  /**
   * Check if OPFS is supported in the current browser
   */
  public static isSupported(): boolean {
    return 'storage' in navigator && 'getDirectory' in navigator.storage;
  }

  /**
   * Initialize OPFS directory structure
   */
  public async initialize(): Promise<void> {
    if (!OPFSManager.isSupported()) {
      throw new Error('OPFS is not supported in this browser');
    }

    try {
      const root = await navigator.storage.getDirectory();

      // Create books directory
      const booksDir = await root.getDirectoryHandle('books', { create: true });

      // Create covers directory
      const coversDir = await root.getDirectoryHandle('covers', { create: true });

      this.directoryStructure = {
        root,
        booksDir,
        coversDir,
      };

      // Ensure config.json exists
      await this.ensureConfigExists();
    } catch (error) {
      throw new Error(`Failed to initialize OPFS: ${error}`);
    }
  }

  /**
   * Ensure config.json exists with default structure
   */
  private async ensureConfigExists(): Promise<void> {
    if (!this.directoryStructure) {
      throw new Error('OPFS not initialized');
    }

    try {
      await this.directoryStructure.root.getFileHandle('config.json');
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

      await this.saveConfig(config);
    }
  }

  /**
   * Load configuration from config.json with error recovery
   */
  public async loadConfig(): Promise<OPFSConfig> {
    if (!this.directoryStructure) {
      throw new Error('OPFS not initialized');
    }

    try {
      const fileHandle = await this.directoryStructure.root.getFileHandle('config.json');
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
        await this.saveConfig(defaultConfig);
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
        await this.saveConfig(defaultConfig);
        return defaultConfig;
      }
      throw new Error(`Failed to load config: ${error}`);
    }
  }

  /**
   * Save configuration to config.json
   */
  public async saveConfig(config: OPFSConfig): Promise<void> {
    if (!this.directoryStructure) {
      throw new Error('OPFS not initialized');
    }

    try {
      const fileHandle = await this.directoryStructure.root.getFileHandle('config.json', {
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
   * Upload and save an EPUB book with metadata extraction
   */
  public async uploadBook(file: File): Promise<BookMetadata> {
    if (!this.directoryStructure) {
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
    const bookPath = `books/${bookId}.epub`;

    try {
      // Save the EPUB file
      const bookFileHandle = await this.directoryStructure.booksDir.getFileHandle(
        `${bookId}.epub`,
        { create: true }
      );
      const writable = await bookFileHandle.createWritable();
      await writable.write(await file.arrayBuffer());
      await writable.close();

      // Extract EPUB metadata
      const epubMetadata = await EPUBMetadataService.extractMetadata(file);

      // Create enhanced book metadata
      const bookMetadata: BookMetadata = {
        id: bookId,
        name: epubMetadata.title || file.name.replace(/\.epub$/i, ''),
        author: epubMetadata.author || 'Unknown Author',
        path: bookPath,
        createdAt: Date.now(),
        size: this.formatFileSize(file.size),
        chapterCount: epubMetadata.chapterCount,
        metaData: epubMetadata,
      };

      // Update config with new book
      const config = await this.loadConfig();
      config.books.push(bookMetadata);
      config.lastSync = Date.now();
      await this.saveConfig(config);

      return bookMetadata;
    } catch (error) {
      throw new Error(`Failed to upload book: ${error}`);
    }
  }

  /**
   * Get all books from config
   */
  public async getAllBooks(): Promise<BookMetadata[]> {
    const config = await this.loadConfig();
    return config.books;
  }

  /**
   * Delete a book and its cover
   */
  public async deleteBook(bookId: string): Promise<void> {
    if (!this.directoryStructure) {
      throw new Error('OPFS not initialized');
    }

    try {
      // Remove book file
      try {
        await this.directoryStructure.booksDir.removeEntry(`${bookId}.epub`);
      } catch {
        // File might not exist, ignore
      }

      // Remove cover file
      try {
        await this.directoryStructure.coversDir.removeEntry(`${bookId}.jpg`);
      } catch {
        // Cover might not exist, ignore
      }

      // Update config
      const config = await this.loadConfig();
      config.books = config.books.filter((book) => book.id !== bookId);
      config.lastSync = Date.now();
      await this.saveConfig(config);
    } catch (error) {
      throw new Error(`Failed to delete book: ${error}`);
    }
  }

  /**
   * Get book file as ArrayBuffer
   */
  public async getBookFile(bookId: string): Promise<ArrayBuffer> {
    if (!this.directoryStructure) {
      throw new Error('OPFS not initialized');
    }

    try {
      const fileHandle = await this.directoryStructure.booksDir.getFileHandle(`${bookId}.epub`);
      const file = await fileHandle.getFile();
      return await file.arrayBuffer();
    } catch (error) {
      throw new Error(`Failed to get book file: ${error}`);
    }
  }

  /**
   * Format file size in human-readable format
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
