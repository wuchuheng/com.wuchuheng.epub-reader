# Preset Book Lazy Loading: Consolidated Specification

## 1. Overview

This document outlines the definitive plan to refactor the preset book loading mechanism. It consolidates previous discussions and focuses on a single, efficient, lazy-loading strategy. The goal is to dramatically improve initial application performance by avoiding eager-loading of books.

**Core Strategy:** An automated script will generate a `seed.json` manifest. The application will, on startup, load books already in the user's local storage and reconcile them with this manifest, creating non-downloaded placeholders for new preset books. The actual book download will only occur on explicit user action.

## 2. Implementation Details

### 2.1. Automated Book Seeding Script (`scripts/seed-books.ts`)

-   **Functionality**: A Node.js script (run with `tsx`) will scan `public/books`, filter for `.epub` files, and generate a `public/seed.json` manifest.
-   **`package.json` Script**: A script will be added to `package.json`:
    ```json
    "scripts": {
      "bookSeed": "tsx scripts/seed-books.ts"
    }
    ```
-   **Manifest Structure**: The generated `public/seed.json` will be a single JSON object where keys are the SHA-256 hashes of the book files. This allows for O(1) lookups.

    ```json
    {
      "a1b2c3d4e5f6...": {
        "fileName": "Heidi.epub",
        "title": "Heidi",
        "url": "/books/Heidi.epub"
      },
      "e5f6g7h8i9j0...": {
        "fileName": "The-social-contract-and-discourses.epub",
        "title": "The Social Contract and Discourses",
        "url": "/books/The-social-contract-and-discourses.epub"
      }
    }
    ```

### 2.2. Application Entry Point (`src/main.tsx`)

-   **Modification**: The eager-loading call `store.dispatch(initializePresetBooks())` **must be removed**. The `main.tsx` file should not be responsible for initiating content loading.

### 2.3. Consolidated Bookshelf Logic (`src/store/slices/bookshelfSlice.ts`)

The core of the refactor will happen here. The two separate initialization thunks will be replaced by a single, unified one.

-   **Thunk Consolidation**: `initializeBookshelf` and `initializePresetBooks` will be removed or repurposed into a single new thunk: `loadBookshelf`.

-   **`loadBookshelf` Async Thunk**:
    1.  **Dispatch**: This will be the only book-loading thunk dispatched from the `HomePage`'s `useEffect` hook.
    2.  **Fetch Local Books**: It will start by calling `OPFSManager.getAllBooks()` to get all books already stored in the user's OPFS. The UI can show these immediately.
    3.  **Fetch Seed Manifest**: Concurrently, it will `fetch('/seed.json')`.
    4.  **Reconcile and Merge**: This is the critical step to combine local and remote book lists.
        -   It will create a `Set` of hashes from the `localBooks` for efficient O(1) lookup.
        -   It will then iterate through the `seed.json` object's keys (hashes).
        -   **Rule**: If a hash from `seed.json` **already exists** in the local hash set, it is ignored. The already-downloaded local version takes precedence.
        -   **Rule**: If a hash from `seed.json` **does not** exist in the local hash set, a new placeholder book object (with `status: 'not-downloaded'`) is created.
    5.  **Reducer**: The `loadBookshelf.fulfilled` reducer will update the `books` array in the Redux store. The new state will be the list of `localBooks` plus the list of newly created `placeholders`.

-   **`downloadPresetBook` Async Thunk**:
    -   This thunk will be triggered on-demand by a user click.
    -   It accepts a placeholder book object.
    -   It fetches the book, saves it to OPFS via `OPFSManager`, and updates the book's state in the store.
    -   **Crucially, it will return the full `BookMetadata` of the newly downloaded book**, including its final, stable ID from OPFS. This is essential for the UI to know which book to open.

### 2.4. UI and Data Flow (`src/pages/HomePage/index.tsx`)

-   **`useEffect` Hook**: On component mount, the hook will be simplified to dispatch a single action: `dispatch(loadBookshelf())`.
-   **Rendering Logic**:
    -   The `BookCard` component will be enhanced to render differently based on `book.status`:
        -   `'local'`: Standard, clickable book card.
        -   `'not-downloaded'`: A visually distinct card with a "tag" or badge. The entire card is clickable.
        -   `'downloading'`: A non-interactive card displaying a progress indicator.
-   **User Interaction and Auto-Open Flow**:
    -   A single click handler (e.g., `handleBookClick`) will manage user interactions.
    -   **If `book.status` is `'local'`**: The handler will navigate immediately to the reader: `navigate(`/reader/${book.id}`).
    -   **If `book.status` is `'not-downloaded'`**:
        1.  The handler will dispatch `downloadPresetBook(book)`.
        2.  It will **`await` the returned promise** from the dispatch. Redux Toolkit's `unwrap()` utility is perfect for this.
        3.  The UI will show the `'downloading'` state for the card.
        4.  Once the download completes, the `await` will resolve, and the thunk will return a payload like `{ book: BookMetadata }`.
        5.  The handler will then use the ID from the returned book metadata to navigate: `navigate(`/reader/${result.payload.book.id}`).
    -   This ensures the user is taken directly to the book they clicked on as soon as it's ready, while other background downloads can continue without interrupting this primary flow.

## 3. Implementation Steps

1.  **Create `scripts/seed-books.ts`**.
2.  **Add `bookSeed` to `package.json`**.
3.  **Run `pnpm bookSeed`**.
4.  **Modify `src/main.tsx`**: Remove the old `initializePresetBooks` dispatch.
5.  **Refactor `src/store/slices/bookshelfSlice.ts`**:
    -   Implement the `loadBookshelf` thunk.
    -   Ensure `downloadPresetBook` returns the final book metadata upon completion.
    -   Remove old initialization thunks.
6.  **Update `src/pages/HomePage/index.tsx`**:
    -   Change the `useEffect` to dispatch `loadBookshelf`.
    -   Implement the new `handleBookClick` handler that awaits the download and navigates upon completion.
7.  **Update `src/components/BookCard/index.tsx`**: Add styles/rendering for `'not-downloaded'` and `'downloading'` states.
8.  **Remove `DEFAULT_PRESET_BOOKS`** from `src/config/config.ts`.
9.  **Update `.gitignore`** to include `public/seed.json`.

This consolidated specification provides a clear and efficient path forward for implementing the lazy-loading feature.
