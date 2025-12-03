/**
 * Context Hash Service
 * Manages context hashing and ID generation logic.
 */

import { logger } from '../utils/logger';
import { HashMapEntry, LatestIdData } from '../types/contextMenuCache';
import { performFileOperation } from '../utils/fileOperations';
import {
  getRootDirectory,
  CONTEXT_MENU_DIR,
  HASH_MAP_DIR,
  LATEST_ID_FILE,
} from './opfs';

/**
 * Generates a SHA256 hash from context string.
 * @param context - The context string to hash
 * @returns 32-character hex string
 */
export const generateContextHash = async (context: string): Promise<string> => {
  if (!context || context.trim().length === 0) {
    throw new Error('Context cannot be empty');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(context.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
};

/**
 * Reads the latest ID from OPFS.
 * @returns Latest context ID (0 if file doesn't exist)
 */
export const getLatestId = async (): Promise<number> => {
  const result = await performFileOperation(async () => {
    const root = await getRootDirectory();
    const contextMenuDir = await root.getDirectoryHandle(CONTEXT_MENU_DIR);
    const fileHandle = await contextMenuDir.getFileHandle(LATEST_ID_FILE);
    const file = await fileHandle.getFile();
    const content = await file.text();
    const data: LatestIdData = JSON.parse(content);
    return data.latestId;
  }, 'read latest ID');

  if (!result.success) {
    logger.error('Failed to read latest ID:', result.error);
    return 0;
  }

  return result.data!;
};

/**
 * Updates the latest ID in OPFS.
 * @param newId - New latest ID to save
 */
export const updateLatestId = async (newId: number): Promise<void> => {
  if (newId < 0) {
    throw new Error('ID must be non-negative');
  }

  const result = await performFileOperation(async () => {
    const root = await getRootDirectory();
    const contextMenuDir = await root.getDirectoryHandle(CONTEXT_MENU_DIR);
    const fileHandle = await contextMenuDir.getFileHandle(LATEST_ID_FILE, { create: true });
    const writable = await fileHandle.createWritable();
    const data: LatestIdData = { latestId: newId };
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
    return true;
  }, `update latest ID to ${newId}`);

  if (!result.success) {
    logger.error('Failed to update latest ID:', result.error);
    throw new Error(result.error);
  }

  logger.log(`Latest ID updated to ${newId}`);
};

/**
 * Reads hash-to-ID mapping from OPFS.
 * @param hash - SHA256 hash string
 * @returns Hash map entry or null if not found
 */
export const readHashMapping = async (hash: string): Promise<HashMapEntry | null> => {
  try {
    const root = await getRootDirectory();
    const contextMenuDir = await root.getDirectoryHandle(CONTEXT_MENU_DIR);
    const hashMapDir = await contextMenuDir.getDirectoryHandle(HASH_MAP_DIR);
    const fileHandle = await hashMapDir.getFileHandle(`${hash}.json`);
    const file = await fileHandle.getFile();
    const content = await file.text();
    const data: HashMapEntry = JSON.parse(content);
    return data;
  } catch {
    return null;
  }
};

/**
 * Saves hash-to-ID mapping to OPFS.
 * @param hash - SHA256 hash string
 * @param id - Context ID
 */
export const saveHashMapping = async (hash: string, id: number): Promise<void> => {
  const result = await performFileOperation(async () => {
    const root = await getRootDirectory();
    const contextMenuDir = await root.getDirectoryHandle(CONTEXT_MENU_DIR);
    const hashMapDir = await contextMenuDir.getDirectoryHandle(HASH_MAP_DIR, { create: true });
    const fileHandle = await hashMapDir.getFileHandle(`${hash}.json`, { create: true });
    const writable = await fileHandle.createWritable();
    const data: HashMapEntry = {
      id,
      hash,
      createdAt: new Date().toISOString(),
    };
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
    return true;
  }, 'save hash mapping');

  if (!result.success) {
    logger.error('Failed to save hash mapping:', result.error);
    throw new Error(result.error);
  }
};
