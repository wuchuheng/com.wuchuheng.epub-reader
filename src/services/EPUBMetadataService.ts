import ePub from 'epubjs';
import { EPUBMetaData } from '../types/book';

/**
 * Service for extracting metadata from EPUB files
 * Handles title, author, cover image extraction and processing
 */
export class EPUBMetadataService {
  /**
   * Extract comprehensive metadata from EPUB file
   */
  public static async extractMetadata(file: File): Promise<EPUBMetaData> {
    try {
      // 1. Input handling - validate file
      if (!file || !file.name.toLowerCase().endsWith('.epub')) {
        throw new Error('Invalid EPUB file');
      }

      // 2. Core processing - load and parse EPUB
      const arrayBuffer = await file.arrayBuffer();
      const book = ePub(arrayBuffer);

      // 3. Output handling - extract metadata
      const metadata = await book.loaded.metadata;
      const cover = await this.extractCoverImage(book);
      const spine = await book.loaded.spine;

      return {
        title: (metadata as any).title || file.name.replace(/\.epub$/i, ''),
        author: this.formatAuthors((metadata as any).creator),
        description: (metadata as any).description,
        publisher: (metadata as any).publisher,
        publishedDate: (metadata as any).date,
        language: (metadata as any).language,
        isbn: this.extractISBN((metadata as any).identifier),
        chapterCount: (spine as any).items?.length || 0,
        coverPath: cover,
      };
    } catch (error) {
      console.error('Failed to extract EPUB metadata:', error);
      return {
        title: file.name.replace(/\.epub$/i, ''),
        author: 'Unknown Author',
        chapterCount: 0,
      };
    }
  }

  /**
   * Format author information from EPUB metadata
   */
  private static formatAuthors(creator: string | string[]): string {
    if (!creator) return 'Unknown Author';

    if (Array.isArray(creator)) {
      return creator.join(', ');
    }

    return creator;
  }

  /**
   * Extract ISBN from identifier field
   */
  private static extractISBN(identifier: string | string[]): string | undefined {
    if (!identifier) return undefined;

    const identifiers = Array.isArray(identifier) ? identifier : [identifier];
    const isbn = identifiers.find((id) => id && id.toLowerCase().includes('isbn'));
    return isbn;
  }

  /**
   * Extract cover image from EPUB
   */
  private static async extractCoverImage(book: any): Promise<string | undefined> {
    try {
      // Try to get cover image
      const cover = (book as any).cover;
      if (cover) {
        return cover;
      }

      // Try to find cover in manifest
      const manifest = await (book as any).loaded.manifest;
      const coverItem = manifest?.find(
        (item: any) =>
          item?.properties?.includes('cover-image') || item?.id?.toLowerCase().includes('cover')
      );

      if (coverItem) {
        return coverItem.href;
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Convert cover image to blob for storage
   */
  public static async extractCoverBlob(book: any): Promise<Blob | undefined> {
    try {
      const coverUrl = await this.extractCoverImage(book);
      if (!coverUrl) return undefined;

      // Get cover as blob
      const coverBlob = await (book as any).resources?.get(coverUrl);
      return coverBlob || undefined;
    } catch {
      return undefined;
    }
  }
}
