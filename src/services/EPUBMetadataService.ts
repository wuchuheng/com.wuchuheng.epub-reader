import ePub, { Book } from 'epubjs';
import { EPUBMetaData } from '../types/book';
import { logger } from '../utils/logger';

/**
 * Extract comprehensive metadata from EPUB file
 */
export async function extractMetadata(file: File): Promise<EPUBMetaData> {
  try {
    logger.log('Starting EPUB metadata extraction for:', file.name);

    // 1. Input handling - validate file
    if (!file || !file.name.toLowerCase().endsWith('.epub')) {
      throw new Error('Invalid EPUB file');
    }

    // 2. Core processing - load and parse EPUB
    const arrayBuffer = await file.arrayBuffer();
    const book = ePub(arrayBuffer);

    // 3. Output handling - extract metadata
    const metadata = await book.loaded.metadata;
    const cover = await extractCoverImage(book);
    const spine = await book.loaded.spine;

    logger.log('Extracted metadata:', {
      title: metadata.title,
      author: metadata.creator,
      coverPath: cover,
      chapterCount: spine?.length,
    });

    return {
      title: metadata.title || file.name.replace(/\.epub$/i, ''),
      author: formatAuthors(metadata.creator),
      description: metadata.description,
      publisher: metadata.publisher,
      publishedDate: metadata.pubdate,
      language: metadata.language,
      isbn: extractISBN(metadata.identifier),
      chapterCount: spine.length || 0,
      coverPath: cover,
    };
  } catch (error) {
    logger.error('Failed to extract EPUB metadata:', error);
    return {
      title: file.name.replace(/\.epub$/i, ''),
      author: 'Unknown Author',
      chapterCount: 0,
    };
  }
}

/**
 * Extract ISBN from identifier field
 */
function extractISBN(identifier: string | string[]): string | undefined {
  if (!identifier) return undefined;

  const identifiers = Array.isArray(identifier) ? identifier : [identifier];
  const isbn = identifiers.find((id) => id && id.toLowerCase().includes('isbn'));
  return isbn;
}

function formatAuthors(creator: string | string[]): string {
  if (!creator) return 'Unknown Author';

  if (Array.isArray(creator)) {
    return creator.join(', ');
  }

  return creator;
}

export async function extractCoverImage(book: Book): Promise<string | undefined> {
  try {
    logger.log('Starting cover image extraction...');

    // Try to get cover image
    const cover = book.loaded.cover;
    if (cover) {
      logger.log('Found cover via book.cover:', cover);
      return cover;
    }

    return undefined;
  } catch (error) {
    logger.error('Error extracting cover image:', error);
    return undefined;
  }
}

export async function getCoverFormat(book: Book): Promise<string | undefined> {
  try {
    const coverBlob = await extractCoverBlob(book);
    if (!coverBlob) {
      logger.warn('No cover blob found, skipping format extraction');
      return undefined;
    }

    const imageFormat = coverBlob.type.split('/')[1];
    logger.log('Extracted cover image format:', imageFormat);
    return imageFormat;
  } catch (err) {
    logger.error('Error extracting cover format:', err);
    return undefined;
  }
}

/**
 * Convert cover image to blob for storage
 */
export async function extractCoverBlob(book: Book): Promise<Blob | undefined> {
  try {
    // Get the cover URL using epub.js proper API
    const coverUrl = await book.coverUrl();
    if (!coverUrl) {
      logger.warn('No cover URL found, skipping blob extraction');
      return undefined;
    }

    logger.log('Extracting cover blob from URL:', coverUrl);

    // Fetch the actual image data as a blob
    const response = await fetch(coverUrl);
    if (!response.ok) {
      logger.warn('Failed to fetch cover image:', response.status);
      return undefined;
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      logger.warn('Empty or invalid cover blob');
      return undefined;
    }

    logger.log('Successfully extracted cover blob:', {
      size: blob.size,
      type: blob.type,
    });

    return blob;
  } catch (err) {
    logger.error('Error extracting cover blob:', err);
    return undefined;
  }
}
