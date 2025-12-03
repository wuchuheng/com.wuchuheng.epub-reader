/**
 * OPFS Storage Service
 * Handles low-level OPFS operations and directory structure constants.
 */

import { logger } from '../utils/logger';
import { performFileOperation } from '../utils/fileOperations';
import { LatestIdData } from '../types/contextMenuCache';

// Constants for directory structure
export const CONTEXT_MENU_DIR = 'contextMenu';
export const HASH_MAP_DIR = 'hashMapId';
export const CACHE_DIR = 'cache';
export const LATEST_ID_FILE = 'latest-id.json';

/**
 * Gets the OPFS root directory handle.
 * @returns Root directory handle
 */
export const getRootDirectory = async (): Promise<FileSystemDirectoryHandle> => {
  if (!('storage' in navigator && 'getDirectory' in navigator.storage)) {
    throw new Error('OPFS is not supported in this browser');
  }
  return await navigator.storage.getDirectory();
};

/**
 * Initializes the context menu cache directory structure in OPFS.
 * Creates: contextMenu/, contextMenu/hashMapId/, contextMenu/cache/, contextMenu/latest-id.json
 */
export const initializeOpfsStructure = async (): Promise<void> => {
  const result = await performFileOperation(async () => {
    const root = await getRootDirectory();

    // Create main contextMenu directory
    const contextMenuDir = await root.getDirectoryHandle(CONTEXT_MENU_DIR, { create: true });

    // Create subdirectories
    await Promise.all([
      contextMenuDir.getDirectoryHandle(HASH_MAP_DIR, { create: true }),
      contextMenuDir.getDirectoryHandle(CACHE_DIR, { create: true }),
    ]);

    // Initialize latest-id.json if not exists
    try {
      await contextMenuDir.getFileHandle(LATEST_ID_FILE);
    } catch {
      const fileHandle = await contextMenuDir.getFileHandle(LATEST_ID_FILE, { create: true });
      const writable = await fileHandle.createWritable();
      const initialData: LatestIdData = { latestId: 0 };
      await writable.write(JSON.stringify(initialData, null, 2));
      await writable.close();
    }

    return true;
  }, 'initialize OPFS structure');

  if (!result.success) {
    logger.error('Failed to initialize OPFS structure:', result.error);
    throw new Error(result.error);
  }

  logger.log('OPFS structure initialized successfully');
};
