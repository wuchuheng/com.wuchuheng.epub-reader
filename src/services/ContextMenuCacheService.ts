/**
 * Context Menu Cache Service
 * Manages OPFS-based caching for context menus and AI responses.
 * Follows functional programming paradigm with pure functions.
 */

import { logger } from '../utils/logger';
import { ContextMetadata, AIToolCache } from '../types/contextMenuCache';
import { performFileOperation } from '../utils/fileOperations';
import {
  getRootDirectory,
  initializeOpfsStructure,
  CONTEXT_MENU_DIR,
  CACHE_DIR,
} from './opfs';
import {
  generateContextHash,
  getLatestId,
  updateLatestId,
  readHashMapping,
  saveHashMapping,
} from './ContextHashService';

// Re-export initialization for backward compatibility
export const initializeContextMenuCache = initializeOpfsStructure;

// Re-export hash/ID functions for backward compatibility if needed
// But internal usage should use the new service imports
export { generateContextHash, getLatestId, updateLatestId };

/**
 * Saves context metadata to OPFS.
 * @param metadata - Context metadata to save
 */
const saveContextMetadata = async (metadata: ContextMetadata): Promise<void> => {
  const result = await performFileOperation(async () => {
    const root = await getRootDirectory();
    const contextMenuDir = await root.getDirectoryHandle(CONTEXT_MENU_DIR);
    const cacheDir = await contextMenuDir.getDirectoryHandle(CACHE_DIR, { create: true });

    const contextIdDir = await cacheDir.getDirectoryHandle(metadata.id.toString(), {
      create: true,
    });

    const fileHandle = await contextIdDir.getFileHandle('cache.json', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(metadata, null, 2));
    await writable.close();

    return true;
  }, `save context metadata for ID ${metadata.id}`);

  if (!result.success) {
    logger.error('Failed to save context metadata:', result.error);
    throw new Error(result.error);
  }
};

/**
 * Retrieves or creates a context ID for given words and context.
 * Uses hash-based deduplication to reuse existing IDs.
 * @param words - Selected words
 * @param context - Surrounding context
 * @returns Context ID (reused if exists, new if not)
 */
export const getOrCreateContextId = async (words: string, context: string): Promise<number> => {
  logger.log('[ContextCache] getOrCreateContextId called', {
    wordsLength: words.length,
    contextLength: context.length,
    wordsPreview: words.slice(0, 50),
  });

  const hash = await generateContextHash(context);
  logger.log('[ContextCache] Hash generated:', hash.slice(0, 16) + '...');

  const existingMapping = await readHashMapping(hash);

  if (existingMapping) {
    logger.log(
      `[ContextCache] ✅ Reusing existing context ID ${existingMapping.id} for hash ${hash.slice(0, 8)}...`
    );
    return existingMapping.id;
  }

  logger.log('[ContextCache] Creating new context ID...');
  const latestId = await getLatestId();
  const newId = latestId + 1;
  logger.log(`[ContextCache] New ID assigned: ${newId}`);

  const metadata: ContextMetadata = {
    id: newId,
    words,
    context,
    createdAt: new Date().toISOString(),
  };

  logger.log('[ContextCache] Saving mappings to OPFS...');
  await Promise.all([
    saveHashMapping(hash, newId),
    saveContextMetadata(metadata),
    updateLatestId(newId),
  ]);
  logger.log(`[ContextCache] ✅ Created new context ID ${newId} for hash ${hash.slice(0, 8)}...`);

  return newId;
};

/**
 * Retrieves context metadata from OPFS.
 * @param id - Context ID
 * @returns Context metadata or null if not found
 */
export const getContextMetadata = async (id: number): Promise<ContextMetadata | null> => {
  const result = await performFileOperation(async () => {
    const root = await getRootDirectory();
    const contextMenuDir = await root.getDirectoryHandle(CONTEXT_MENU_DIR);
    const cacheDir = await contextMenuDir.getDirectoryHandle(CACHE_DIR);
    const contextIdDir = await cacheDir.getDirectoryHandle(id.toString());
    const fileHandle = await contextIdDir.getFileHandle('cache.json');

    const file = await fileHandle.getFile();
    const content = await file.text();
    const data: ContextMetadata = JSON.parse(content);

    return data;
  }, `read context metadata for ID ${id}`);

  if (!result.success) {
    logger.error(`Context metadata not found for ID ${id}:`, result.error);
    return null;
  }

  return result.data!;
};

/**
 * Checks if AI tool cache exists for given context and tool.
 * @param contextId - Context ID
 * @param toolName - AI tool name (e.g., "语境", "同义词")
 * @returns AI tool cache or null if not found
 */
export const checkAIToolCache = async (
  contextId: number,
  toolName: string
): Promise<AIToolCache | null> => {
  const result = await performFileOperation(async () => {
    const root = await getRootDirectory();
    const contextMenuDir = await root.getDirectoryHandle(CONTEXT_MENU_DIR);
    const cacheDir = await contextMenuDir.getDirectoryHandle(CACHE_DIR);
    const contextIdDir = await cacheDir.getDirectoryHandle(contextId.toString());
    const fileHandle = await contextIdDir.getFileHandle(`${toolName}.json`);

    const file = await fileHandle.getFile();
    const content = await file.text();
    const data: AIToolCache = JSON.parse(content);

    return data;
  }, `check AI tool cache for ${toolName} (context ${contextId})`);

  if (!result.success) {
    return null;
  }

  logger.log(`Cache HIT for ${toolName} (context ${contextId})`);
  return result.data!;
};

/**
 * Saves AI tool cache to OPFS.
 * @param contextId - Context ID
 * @param toolName - AI tool name
 * @param cache - AI tool cache data
 */
export const saveAIToolCache = async (
  contextId: number,
  toolName: string,
  cache: AIToolCache
): Promise<void> => {
  const result = await performFileOperation(async () => {
    const root = await getRootDirectory();
    const contextMenuDir = await root.getDirectoryHandle(CONTEXT_MENU_DIR);
    const cacheDir = await contextMenuDir.getDirectoryHandle(CACHE_DIR);
    const contextIdDir = await cacheDir.getDirectoryHandle(contextId.toString(), { create: true });

    const fileHandle = await contextIdDir.getFileHandle(`${toolName}.json`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(cache, null, 2));
    await writable.close();

    return true;
  }, `save AI tool cache for ${toolName} (context ${contextId})`);

  if (!result.success) {
    logger.error('Failed to save AI tool cache:', result.error);
    throw new Error(result.error);
  }

  logger.log(`Cache saved for ${toolName} (context ${contextId})`);
};
