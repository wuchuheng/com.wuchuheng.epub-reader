/**
 * Constants and configuration for EPUB reader functionality
 */

/**
 * Touch interaction timing constants (in milliseconds)
 */
export const TOUCH_TIMING = {
  LONG_PRESS_DURATION: 500,
  REGULAR_TAP_THRESHOLD: 300,
  SELECTION_DELAY: 50,
  CLICK_DELAY: 10,
} as const;

/**
 * Selection color configuration
 */
export const SELECTION_COLORS = {
  BACKGROUND: 'rgba(0, 123, 255, 0.3)',
  TEXT_INHERIT: 'inherit',
} as const;

/**
 * Word boundary regex pattern for text selection
 */
export const WORD_BOUNDARY_REGEX = /[\s.,;:!?'"()[\]{}<>«»‹›""''`~@#$%^&*+=|\\/\-—–]/;

/**
 * File size limits and validation constants
 */
export const FILE_CONSTANTS = {
  MAX_EPUB_SIZE: 100 * 1024 * 1024, // 100MB
  EPUB_EXTENSIONS: ['.epub'] as const,
  EPUB_MIME_TYPES: [
    'application/epub+zip',
    'application/x-zip-compressed',
    'application/zip'
  ] as const,
} as const;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  THEME: 'light' as const,
  FONT_SIZE: 'medium' as const,
  CONFIG_VERSION: 1,
  DEFAULT_MAX_SELECTED_WORDS: 10000,
  DEFAULT_MAX_CONCURRENT_REQUESTS: 2,
  DEFAULT_DISPLAY_MODE: 'stacked' as const,
} as const;

/**
 * EPUB rendering configuration
 */
export const RENDERING_CONFIG = {
  WIDTH: '100%',
  HEIGHT: '100%',
  SPREAD: 'always' as const,
  MIN_SPREAD_WIDTH: 800,
  MANAGER: 'continuous' as const,
  FLOW: 'paginated' as const,
  LOCATION_CHAR_COUNT: 1600,
} as const;
