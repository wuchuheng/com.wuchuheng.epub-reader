# Feature Specification: Simplified Home Page Upload

## 1. Background & Problem
The current book upload process on the Home Page is "over-designed." It requires a user to click "Upload Book" to reveal a specific drop zone area before they can interact with it. This adds unnecessary friction.

## 2. Goals
- **Direct Drag-and-Drop:** Enable dragging and dropping an EPUB file directly onto the Home Page (the entire visible area) to trigger an upload.
- **Simplified Button Action:** Clicking the "Upload Book" button should immediately open the system file picker, removing the intermediate step of showing a drop zone.
- **Visual Feedback:** Provide clear visual feedback (e.g., a full-page overlay) when a user drags a file over the page.

## 3. User Experience (UX) Design

### 3.1. Drag and Drop
- **Trigger:** User drags a file from their OS into the browser window while on the Home Page.
- **Feedback:** A semi-transparent overlay appears covering the book list/content.
  - **Content:** "Drop your EPUB file here to upload" (or similar).
  - **Style:** Dashed border, dimmed background, centered icon/text.
- **Action:** Dropping the file initiates the upload validation and process immediately.
- **Cancellation:** Draging the file *out* of the window or pressing `Esc` (if applicable) hides the overlay.

### 3.2. "Upload Book" Button
- **Trigger:** User clicks "Upload Book" in the header.
- **Action:** Opens the native OS file selection dialog immediately.
- **Post-Selection:** Selecting a valid EPUB file initiates the upload process.

## 4. Technical Implementation

### 4.1. Component: `BookshelfPage` (`src/pages/HomePage/index.tsx`)

**State Management:**
- Remove `showUploadZone` state.
- Add `isDragging` (boolean) state to track drag events.

**Event Listeners:**
- Attach `dragenter`, `dragover`, `dragleave`, and `drop` event listeners to the main page container (or `window` if preferred for a truly global feel).
- **`dragenter` / `dragover`**:
  - Prevent default behavior.
  - Set `isDragging` to `true`.
- **`dragleave`**:
  - Prevent default behavior.
  - Set `isDragging` to `false` (careful with bubbling events from child elements; may need to check `event.relatedTarget`).
- **`drop`**:
  - Prevent default behavior.
  - Set `isDragging` to `false`.
  - Extract files from `event.dataTransfer.files`.
  - Call the upload handler.

**File Input:**
- Add a hidden `<input type="file" accept=".epub" />` element.
- Create a `useRef` to access this input.
- Update the "Upload Book" button `onClick` handler to trigger `fileInputRef.current.click()`.

**Upload Logic:**
- Reuse the upload logic currently in `UploadZone` (validation -> dispatch `uploadBook`).
- Ideally, extract this logic into a custom hook (e.g., `useBookUpload`) to share between the drop handler and the file input handler.

### 4.2. Component: `DragOverlay` (New or Refactored)
- Create a new visual component (or refactor `UploadZone`) to serve as the visual cue.
- **Props:** `isVisible` (boolean).
- **Render:**
  - Fixed position (`fixed inset-0`), z-index high.
  - Flexbox centering for text/icon.
  - `pointer-events-none` (usually good to avoid flickering `dragleave` events, though the parent handles the drop).

### 4.3. File Structure Changes
- **`src/pages/HomePage/components/DragOverlay.tsx`**: New component.
- **`src/pages/HomePage/hooks/useBookUpload.ts`**: (Optional but recommended) Logic extraction.

## 5. Detailed Logic

### 5.1. Drag Detection (The `dragleave` Flickering Issue)
Implementing drag-and-drop on a container with children can cause flickering (events firing as you drag over child elements).
**Solution:**
- Use a counter (e.g., `dragCounter.current`) or check `event.relatedTarget`.
- **On `dragenter`**: Increment counter.
- **On `dragleave`**: Decrement counter. If counter === 0, `setIsDragging(false)`.
- **On `drop`**: Reset counter to 0.

## 6. Tasks Checklist
1.  [ ] Create `src/pages/HomePage/components/DragOverlay.tsx`.
2.  [ ] Refactor `BookshelfPage` to remove the old `UploadZone` toggle logic.
3.  [ ] Implement the hidden file input and connect the "Upload Book" button.
4.  [ ] Implement the global drag-and-drop event handlers with overlay toggling.
5.  [ ] Ensure file validation (EPUB only) and error handling (alerts/toasts) are preserved.

## 7. Future Considerations
- Support for multiple file uploads (currently assumed single file).
- Progress bar integration for large files (if not already global).
