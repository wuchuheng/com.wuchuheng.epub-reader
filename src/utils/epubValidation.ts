/**
 * EPUB file validation utilities
 * Provides consistent validation logic across the application
 */

import { FILE_CONSTANTS } from '../constants/epub';

/**
 * Maximum allowed file size for EPUB uploads (100MB)
 */
export const MAX_EPUB_SIZE = FILE_CONSTANTS.MAX_EPUB_SIZE;

/**
 * Supported EPUB file extensions
 */
export const EPUB_EXTENSIONS = FILE_CONSTANTS.EPUB_EXTENSIONS;

/**
 * MIME types for EPUB files
 */
export const EPUB_MIME_TYPES = FILE_CONSTANTS.EPUB_MIME_TYPES;

/**
 * Validates if a file is a valid EPUB file
 * @param file The file to validate
 * @returns True if the file is a valid EPUB
 */
export const isValidEpubFile = (file: File): boolean => {
  const hasValidExtension = EPUB_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
  const hasValidSize = file.size > 0 && file.size <= MAX_EPUB_SIZE;
  const hasValidMime =
    EPUB_MIME_TYPES.includes(file.type as (typeof EPUB_MIME_TYPES)[number]) ||
    EPUB_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));

  return hasValidExtension && hasValidSize && (hasValidMime || hasValidExtension);
};

/**
 * Gets validation error message for an invalid EPUB file
 * @param file The file to validate
 * @returns Error message or null if valid
 */
export const getEpubValidationError = (file: File): string | null => {
  if (!file) return 'No file provided';

  const hasValidExtension = EPUB_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));

  if (!hasValidExtension) {
    return 'Only EPUB files are supported';
  }

  if (file.size === 0) {
    return 'File is empty';
  }

  if (file.size > MAX_EPUB_SIZE) {
    return `File size exceeds ${formatFileSize(MAX_EPUB_SIZE)} limit`;
  }

  return null;
};

/**
 * Formats file size in human-readable format
 * @param bytes Size in bytes
 * @returns Formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
