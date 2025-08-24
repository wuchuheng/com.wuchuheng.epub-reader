/**
 * File operation utilities for consistent error handling and logging
 */

import { logger } from './logger';

/**
 * Result type for file operations
 */
export type FileOperationResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Wrapper for file operations with consistent error handling
 * @param operation The operation to perform
 * @param operationName Name for logging purposes
 * @returns Promise with operation result
 */
export const performFileOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<FileOperationResult<T>> => {
  try {
    logger.log(`Starting ${operationName}`);
    const result = await operation();
    logger.log(`Successfully completed ${operationName}`);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to ${operationName}:`, error);
    return { success: false, error: errorMessage };
  }
};

/**
 * Safe file reader utility for Base64 conversion
 * @param file The file to convert
 * @returns Promise with Base64 string or null
 */
export const fileToBase64 = (file: File): Promise<string | null> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      logger.error('Failed to convert file to Base64');
      resolve(null);
    };
  });

/**
 * Creates a safe file handle getter with error handling
 * @param getHandle Function to get file handle
 * @param fileName Name of the file for logging
 * @returns Promise with file handle or null
 */
export const safeGetFileHandle = async (
  getHandle: () => Promise<FileSystemFileHandle>,
  fileName: string
): Promise<FileSystemFileHandle | null> => {
  try {
    return await getHandle();
  } catch (error) {
    logger.error(`Failed to get file handle for ${fileName}:`, error);
    return null;
  }
};

/**
 * Creates a safe directory handle getter with error handling
 * @param getHandle Function to get directory handle
 * @param dirName Name of the directory for logging
 * @returns Promise with directory handle or null
 */
export const safeGetDirectoryHandle = async (
  getHandle: () => Promise<FileSystemDirectoryHandle>,
  dirName: string
): Promise<FileSystemDirectoryHandle | null> => {
  try {
    return await getHandle();
  } catch (error) {
    logger.error(`Failed to get directory handle for ${dirName}:`, error);
    return null;
  }
};
