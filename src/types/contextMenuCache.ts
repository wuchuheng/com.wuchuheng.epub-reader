/**
 * Type definitions for Context Menu Cache System
 * All types are immutable and used in functional programming style
 */

/**
 * Metadata for a single context (selected text + surrounding context).
 */
export interface ContextMetadata {
  /** Unique context ID (monotonically increasing). */
  id: number;
  /** Selected words/text. */
  words: string;
  /** Surrounding context with <selected> tags. */
  context: string;
  /** ISO timestamp of creation. */
  createdAt: string;
}

/**
 * AI tool conversation cache entry.
 */
export interface AIToolCache {
  /** Tool name (e.g., "语境", "同义词"). */
  toolName: string;
  /** Conversation history (user/assistant messages). */
  conversations: ReadonlyArray<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  /** Token usage statistics. */
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  /** ISO timestamp of last update. */
  updatedAt: string;
  /** Model used for this response. */
  model: string;
}

/**
 * Latest ID counter stored in OPFS.
 */
export interface LatestIdData {
  /** Current highest context ID. */
  latestId: number;
}

/**
 * Hash-to-ID mapping stored in OPFS.
 */
export interface HashMapEntry {
  /** Context ID. */
  id: number;
  /** SHA256 hash (32-char hex). */
  hash: string;
  /** ISO timestamp of creation. */
  createdAt: string;
}

/**
 * Result type for operations that can fail.
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };
