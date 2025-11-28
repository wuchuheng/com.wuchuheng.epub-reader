# Feature: Storage Overview & Full Reset

## 1. Background
- Users cache EPUB files, covers, and settings in OPFS; there is no clear place to see how much space they use or to wipe everything at once.
- Support needs a single, obvious entry point for confirming and performing a destructive reset of local data.

## 2. Goals
- Add a Settings navigation item that shows all OPFS-stored files with their sizes.
- Provide a single button to delete all cached data (books, covers, and `config.json`) with a clear danger warning and confirmation.

## 3. Scope
- UI: new Storage page under Settings with summaries, file list, and a danger-zone reset.
- Data layer: utilities to list OPFS file sizes and to clear both books and config, then rebuild defaults.

## 4. UX Behavior
- Navigation: add “Storage” under `/settings/storage` in the left rail.
- Summary cards: show total cached size, books size, and config size.
- File list: table of every OPFS file path with human-readable sizes, sorted largest first.
- Danger zone:
  - Copy: warns that all cached data (books, covers, config) will be removed and cannot be undone.
  - Button: “Delete all cached data”; disabled when OPFS unsupported or while running.
  - Confirmation: `window.confirm` prompt before execution.
  - Feedback: inline success/error text after the operation.
- Unsupported browsers: yellow notice explaining OPFS is unavailable; actions disabled.

## 5. Implementation Notes
- New OPFS helpers:
  - `getStorageStats`: recursively lists files under the OPFS root and returns total bytes.
  - `resetAllData`: removes `books/` and `config.json`, resets cached handles, and re-initializes defaults.
  - Default builders consolidate context menu defaults to avoid drift during recreation.
- UI pulls sizes via `getStorageStats`, derives config and book totals, and refreshes data after reset.

## 6. Acceptance Criteria
- Settings nav includes Storage and routes to `/settings/storage`.
- Storage page displays total, books, and config sizes, plus a list of cached files.
- Clicking “Delete all cached data” after confirmation removes books and config; the file list shows empty state afterward.
- Errors and unsupported-browser states surface inline; the reset button is disabled when actions are not possible.
