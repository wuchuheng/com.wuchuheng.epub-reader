# Storage Page Lazy-Load Specification

## Overview

Refactor the Storage page (`/settings/storage`) to prioritize performance by replacing full-list pagination
with a lazy-loaded directory tree. The UI should only fetch OPFS entries for the directory the user is
viewing. Children load on demand when a directory is expanded. File-level actions (details, preview,
download) remain available without scanning the entire filesystem up front.

## Current Issues

1. **Expensive traversal**: Listing all OPFS entries on mount scales poorly as the library grows.
2. **Slow size calculation**: Computing OPFS usage by walking every file does not scale and blocks the UI.
3. **Path readability**: Long paths still need truncation support to avoid layout breakage.
4. **Limited actions**: Users still need details, preview, and download capabilities per file.

## Goals

- Load only what is needed: first level at mount, deeper levels on expand.
- Avoid full-tree scans for OPFS size; rely on cached totals with explicit, user-triggered rebuilds when needed.
- Keep file actions (detail, preview, download) available with minimal I/O.
- Preserve readable paths (start-ellipsis) and hover tooltips.
- Maintain accessibility and responsive layout.

## Requirements

### 1) Lazy-Loaded Directory Tree (replaces pagination)

- **Initial load**: Fetch only root-level entries (files + directories).
- **Expand behavior**:
  - Clicking a directory loads its direct children only.
  - Show loading state per directory while fetching children.
  - Cache loaded children per directory to avoid redundant fetches.
  - Support collapse/expand toggle; collapsing does not discard cached children.
- **Sorting**: Directories before files; within each group sort by name ASC. Optional secondary sort by
  size for files if desired.
- **Empty directory**: Show "Empty directory" row for folders with no children.
- **Error handling**: Per-directory error message with retry affordance.
- **Path display**: For each node, display the name; show full path on tooltip and optional secondary text.
- **Accessibility**: Expand/collapse via keyboard; aria-expanded on directory toggles; clear focus states.
- **No pagination**: Remove pagination controls and related i18n keys from the UI once tree is live.

### 2) Path Ellipsis (start-truncation)

Use the RTL trick to truncate from the start while showing filename and nearest parent:

```tsx
<div
  className="overflow-hidden text-ellipsis whitespace-nowrap"
  style={{ direction: 'rtl', textAlign: 'left' }}
  title={entry.path}
>
  {entry.path}
</div>
```

### 3) File Actions

- **Detail**: Same as before (path, size, type, extension, last modified). Reuse existing `FileDetailsModal`.
- **Preview**: Text and image support; unsupported message otherwise. Reuse `FilePreviewModal`.
- **Download**: Use OPFS fetch + `URL.createObjectURL` with cleanup; filename derived from path basename.
- **Action placement**: Inline with file row; hide actions for directories except expand/collapse.

### 4) UI/UX Layout

- Tree list with indentation to reflect hierarchy.
- Directory rows: caret/chevron icon, name, optional child-count badge, per-row loading/error states.
- File rows: name/path + size + action icons (info/preview/download).
- Loading indicators:
  - Global skeleton/spinner for initial root load.
  - Per-directory spinner while loading children.
- Responsive: Indentation and actions should wrap nicely on small screens.

### 5) I18n Keys (proposed additions/changes)

```json
{
  "storage": {
    "tree": {
      "loadingRoot": "Loading storage…",
      "loadingChildren": "Loading…",
      "emptyDirectory": "Empty directory",
      "loadError": "Failed to load this folder",
      "retry": "Retry",
      "expand": "Expand",
      "collapse": "Collapse"
    },
    "table": {
      "actions": {
        "detail": "View details",
        "preview": "Preview file",
        "download": "Download file"
      }
    },
    "modals": {
      "detail": { "...": "..." },
      "preview": { "...": "..." }
    }
  }
}
```

Remove pagination strings once tree lands; keep modal/action keys.

### 6) OPFS Service Updates

- **New helper**: `listDirectoryEntries(path?: string)` → returns `{ kind: 'directory' | 'file'; path; name; size? }[]`
  - `path` is full relative path from root (e.g., `books/123/cover.jpg`).
  - For directories, `size` can be omitted or zero; no deep traversal.
  - Uses OPFS handles to enumerate only the requested directory.
- **Reuse**: Keep `getFileByPath` for preview/download.
- **Optional**: Keep existing `getStorageStats` for header cards; decouple tree rendering from full scan.

### 7) OPFS size calculation (performance-first)

- Do not compute OPFS totals by traversing every file on page load or routine UI renders.
- Store a cached size index in OPFS (for example, `__size_index.json`) with `totalBytes`, `updatedAt`, `version`, and
  optional per-path aggregates for future use.
- Update the cached total incrementally whenever we write or delete files (book uploads, cover saves, config writes,
  deletes/reset). Read each touched file size once and apply deltas.
- Expose `getOpfsSize({ refresh?: boolean })`:
  - Default: read cached `totalBytes` (single fast read); if missing, surface “unknown” rather than forcing a scan.
  - `refresh: true`: background full walk to rebuild the index; chunk traversal to avoid blocking the main thread and
    persist the new total.
- UI should show cached size when present and offer an explicit “Recalculate size (slow)” action with status; never
  auto-trigger the deep scan.
- If quota is shown, rely on `navigator.storage.estimate()` for quota only; guard against undefined/NaN and avoid mixing
  it into the OPFS usage calculation to prevent “undefined” unit artifacts.
- Harden `formatFileSize` and any usage display to handle non-finite numbers gracefully.

## Component Architecture

- **StoragePage**:
  - State: `rootEntries`, `expandedPaths`, `childrenByPath`, `loadingPaths`, `errorByPath`, `selectedEntry`
    (for modals).
  - Handlers: load root, load children for a directory, toggle expand, open detail/preview, download.
  - Derived: map of nodes for rendering the tree.
- **DirectoryTree components** (new):
  - `DirectoryNode` handles expand/collapse, loading state, error retry, renders children recursively.
  - `FileRow` renders file info + action buttons.
  - Shared ellipsis/path tooltip handling.
- **Modals**: Reuse existing `FileDetailsModal` and `FilePreviewModal` for actions.

## Implementation Plan

1) OPFS helper
   - Add `listDirectoryEntries(path?: string)` for shallow reads only.
   - Ensure robust error handling and path normalization.

2) Tree UI
   - Replace pagination list with a directory tree component.
   - Add expand/collapse controls, loading states, empty-state rows, and retry on child load error.
   - Keep start-ellipsis path display and tooltips.

3) Actions integration
   - Wire detail, preview, download on file nodes.
   - Preserve existing modals and download flow; no actions on directories beyond expand/collapse.

4) Cleanup + i18n
   - Add tree-related strings; remove pagination strings once unused.
   - Ensure focus and aria attributes on toggles and buttons.

5) OPFS size tracking
   - Add cached size index read + refresh paths; wire incremental updates into write/delete/reset operations.
   - Keep the slow full scan strictly user-triggered and chunked; show status in the UI.

6) Testing
   - Root load without deep traversal.
   - Expand/collapse directories; verify caching (no repeat OPFS calls).
   - Empty directory rendering; per-directory error/retry.
   - Detail/preview/download on nested files.
   - Long path truncation and tooltip.
   - Responsive layout and keyboard navigation.

## Out of Scope / Future

- Search/filter across tree.
- Bulk actions (multi-select delete/download).
- Virtualized rendering for extremely deep trees.
- Server sync; OPFS-only scope remains.
