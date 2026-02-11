// Table of Contents item structure
export interface TocItem {
  href: string;
  label: string;
  subitems?: TocItem[];
}

export type ContextMenu = {
  tabIndex: number | null;
  words: string;
  context: string;
};

export type SelectInfo = Pick<ContextMenu, 'words' | 'context'>;

/**
 * Represents a common context menu item.
 *
 * @property name - The display name of the menu item.
 * @property shortName - (Optional) A short name for the menu item.
 */
export type ContextMenuItemCommon = {
  // The display name of the context menu item.
  name: string;
  // An optional short name for the context menu item.
  shortName?: string;
  // Indicates whether the tool is active in the context menu.
  enabled?: boolean;
  // Whether the tool can handle single-word selections.
  supportsSingleWord?: boolean;
  // Whether the tool can handle multi-word selections.
  supportsMultiWord?: boolean;
};

/**
 * Represents an AI setting item used for configuring AI-related features.
 *
 * @property prompt - The prompt string to be used by the AI model.
 * @property model - The identifier or name of the AI model.
 * @property reasoningEnabled - Optional flag indicating if reasoning with LLM is enabled.
 * @remarks
 * This type extends {@link ContextMenuItemCommon} to include common context menu properties.
 */
export type AISettingItem = {
  type: 'AI';
  /** The prompt string to be used by the AI model. */
  prompt: string;
  /** The identifier or name of the AI model. Optional/Deprecated in favor of global default. */
  model?: string;
  /** Optional flag indicating if reasoning with LLM is enabled. */
  reasoningEnabled?: boolean;
} & ContextMenuItemCommon;

/**
 * Represents a setting item for an iframe, including its URL and common context menu properties.
 *
 * @property url - The URL to be loaded in the iframe.
 * @remarks
 * This type extends {@link ContextMenuItemCommon}, inheriting its properties.
 */
export type IframeSettingItem = {
  type: 'iframe';
  // The URL to be loaded in the iframe. this url can access both parameters: "words" and "context"
  // For example: https://example.com?words={{words}}&context={{context}},
  // this will replace the parameters with actual values
  url: string;
} & ContextMenuItemCommon;

// Represents a context menu item, which can be either an AI setting item or an iframe setting item.
export type ContextMenuItem = AISettingItem | IframeSettingItem;

import { AiProviderId } from '@/config/aiProviders';

// ... (existing imports)

// ... (existing types)

/**
 * Represents the settings for a context menu, including API endpoint, authentication key,
 * and a list of context menu items.
 *
 * @property api - The API endpoint used for context menu actions.
 * @property key - The authentication key required for API access.
 * @property defaultModel - Global default model for all AI tools.
 * @property providerId - The ID of the selected AI provider.
 * @property providerApiKeyCache - Cache of API keys for different providers.
 * @property items - An array of ContextMenuItem objects representing individual menu items.
 */
export type ContextMenuSettings = {
  // The API endpoint used for context menu actions.
  api: string;
 // The authentication key required for API access.
  key: string;
  // Default model for the currently selected provider
  defaultModel?: string;
  
  // Whether the context menu should open maximized by default.
  pinnedMaximized?: boolean;

  // The ID of the selected AI provider
  providerId?: AiProviderId;
  // Cache of API keys for different providers
  providerApiKeyCache?: Partial<Record<AiProviderId, string>>;
  // Cache of default models keyed by provider
  providerDefaultModelCache?: Partial<Record<AiProviderId, string>>;

  // Maximum number of words allowed in a selection before blocking context menu
  maxSelectedWords?: number;

  // Maximum concurrent AI requests allowed per API base URL
  maxConcurrentRequests?: number;

  /**
   * Display mode for the context menu.
   * - 'stacked': All tools in one scrollable view (current behavior).
   * - 'tabbed': Show one tool at a time (new behavior).
   */
  displayMode?: 'stacked' | 'tabbed';

  // An array of ContextMenuItem objects representing individual menu items.
  items: ContextMenuItem[];
};


/**
 * Touch state for mobile selection handling
 */
export interface TouchState {
  isLongPress: boolean;
  startTime: number;
  startPos: { x: number; y: number };
  timer: NodeJS.Timeout | null;
}

/**
 * Extended Rendition interface with manager property
 */
export interface ExtendedRendition {
  manager?: {
    container?: HTMLElement;
  };
  currentLocation(): {
    start?: {
      cfi?: string;
    };
  };
}
