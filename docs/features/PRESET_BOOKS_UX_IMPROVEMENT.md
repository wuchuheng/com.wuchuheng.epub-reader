# Specification: Improved Preset Books Loading UX

## 1. Problem Description
Currently, when the Immersive Reader app loads built-in (preset) books for the first time:
- The Home Page may display an "Empty State" ("No books yet") while the background synchronization of preset books is still calculating which books need to be downloaded.
- Preset books only appear as placeholders one-by-one as their individual downloads start.
- Users on slow connections may experience a significant delay where the app appears empty, leading to a poor first-impression.
- A page refresh is often required to see the updated library if the background tasks don't correctly trigger UI updates.

## 2. Proposed Solution
We will enhance the bookshelf initialization process to be more transparent and immediate:
1.  **Batch Placeholder Addition**: Immediately upon detecting which preset books are missing, add placeholders for ALL of them to the Redux state in one go.
2.  **Initialization Tracking**: Introduce an explicit `isInitializingPresets` state to track the background sync process.
3.  **Synchronized Empty State**: Prevent the "No books yet" message from appearing until the app has confirmed that no local books exist AND no preset books are being added.
4.  **Independent Book Lifecycles**: Each book card will manage its own state. As soon as a book transitions from `downloading` to `local`, it must become immediately interactive (clickable/readable) without waiting for other background downloads to finish.
5.  **Live Updates**: Ensure the Redux state transitions smoothly from `downloading` to `local` without requiring a manual refresh.

## 3. Technical Changes

### 3.1. Redux State (`src/store/slices/bookshelfSlice.ts`)
- Add `isInitializingPresets: boolean` to `BookshelfState`.
- Add a new action `addPlaceholderBooks` (plural) to add multiple placeholders at once.
- Update `initializePresetBooks` thunk:
    - Set `isInitializingPresets` to `true` at the beginning.
    - Calculate missing books.
    - Dispatch `addPlaceholderBooks` for all missing books immediately.
    - Set `isInitializingPresets` to `false` when finished identifying/dispatching downloads.

### 3.2. Home Page (`src/pages/HomePage/index.tsx`)
- Update the condition for showing the empty state:
    - OLD: `!isLoading && books.length === 0`
    - NEW: `!isLoading && !isInitializingPresets && books.length === 0`
- Update the condition for showing the loading spinner:
    - Include `isInitializingPresets` if `books.length === 0`.

### 3.3. Book Card (`src/components/BookCard/index.tsx`)
- Ensure placeholders for preset books are visually distinct if needed (e.g., showing "Queued" if download hasn't started yet).

## 4. User Experience Workflow
1.  **User opens app**: `initializeBookshelf` runs (loads local OPFS books).
2.  **Home Page shows loading**: If no local books, a spinner is shown.
3.  **Sync starts**: `initializePresetBooks` runs in background.
4.  **Placeholders appear**: Missing preset books (like "Heidi") appear as cards with "Pending" or "Downloading" status immediately.
5.  **No "Empty" flicker**: The user never sees "No books yet" if preset books are about to be added.
6.  **Progress tracking**: As each book downloads, its card shows a progress bar.
7.  **Auto-completion**: Once a download finishes, the card automatically transforms into a regular book card (with cover and "Read" action) without a refresh.

## 5. Acceptance Criteria
- [ ] First-time users see preset book placeholders immediately after the initial load.
- [ ] The "No books yet" message only appears if there are truly no local books and no preset books to download.
- [ ] Book cards update their status (Progress -> Local) dynamically.
- [ ] No manual refresh is required to see the downloaded books.
