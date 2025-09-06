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
  type: 'AI' | 'iframe';
  // The display name of the context menu item.
  name: string;
  // An optional short name for the context menu item.
  shortName?: string;
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
  /** The prompt string to be used by the AI model. */
  prompt: string;
  /** The identifier or name of the AI model. */
  model: string;
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
  // The URL to be loaded in the iframe. this url can access both parameters: "words" and "context"
  // For example: https://example.com?words={{words}}&context={{context}},
  // this will replace the parameters with actual values
  url: string;
} & ContextMenuItemCommon;

// Represents a context menu item, which can be either an AI setting item or an iframe setting item.
export type ContextMenuItem = AISettingItem | IframeSettingItem;

/**
 * Represents the settings for a context menu, including API endpoint, authentication key,
 * and a list of context menu items.
 *
 * @property api - The API endpoint used for context menu actions.
 * @property key - The authentication key required for API access.
 * @property items - An array of ContextMenuItem objects representing individual menu items.
 */
export type ContextMenuSettings = {
  // The API endpoint used for context menu actions.
  api: string;
  // The authentication key required for API access.
  key: string;

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
