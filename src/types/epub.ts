/**
 * EPUB.js type extensions and application-specific types
 */

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
