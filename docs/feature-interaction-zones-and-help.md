# Feature: Interaction Zones & Help Mode

## 1. Overview

This feature overhauls the reader's interaction model to distinguish clearly between **text selection** and **navigation/menu actions** based on where the user clicks. It introduces "Smart Zones" for empty space interactions and a "Help Mode" to visualize these zones.

### Problem Statement
Currently, clicking on empty space often results in the application selecting the nearest text (due to default browser/library behaviors), creating a conflict with navigation intent. Users cannot reliably click "empty" areas to toggle menus or turn pages because the app prioritizes text selection.

### Goals
1.  **Strict Separation:** Clicking text -> Selection/Context Menu. Clicking empty space -> Navigation/App Menu.
2.  **Smart Zones:** When clicking empty space:
    *   **Left Zone (20%):** Go to Previous Page.
    *   **Center Zone (60%):** Toggle App Menu.
    *   **Right Zone (20%):** Go to Next Page.
3.  **Help Mode:** A visual overlay explaining these zones, triggered by a new header button.

## 2. Functional Requirements

### 2.1. Interaction Zones (Smart Clicks)
The `ReaderView` click handling will be updated to detect the X-coordinate of the click event relative to the viewport width.

-   **Condition:** Triggered ONLY when `selection` is empty/invalid.
-   **Logic:**
    ```typescript
    const width = view.clientWidth;
    const x = event.clientX;

    if (x < width * 0.2) {
        action = "PREVIOUS_PAGE";
    } else if (x > width * 0.8) {
        action = "NEXT_PAGE";
    } else {
        action = "TOGGLE_MENU";
    }
    ```
-   **Conflict Resolution:** We must ensure that clicks on empty space do NOT trigger the text selection logic. This may involve validating the event target in the `selection.service` or ensuring `window.getSelection()` is cleared if the click target was not text.

### 2.2. Help Mode Overlay
A new UI layer that sits on top of the reader to explain the zones.

-   **Trigger:** A "?" (Help) icon in the `ReaderHeader`.
-   **Layout:**
    -   Full-screen transparent overlay.
    -   Three column layout corresponding to the zones (20% / 60% / 20%).
    -   Vertical dividers (borders) between columns.
    -   **Left Column:** Text "Previous Page" (vertically centered).
    -   **Center Column:** Text "Menu" (vertically centered).
    -   **Right Column:** Text "Next Page" (vertically centered).
-   **Styling:**
    -   Background: Semi-transparent black (e.g., `bg-black/50`) or white depending on theme, enough to see the book behind it but read the help text.
    -   Text: High contrast, large, centered.
-   **Behavior:**
    -   Clicking *anywhere* on the help overlay closes it.
    -   The overlay consumes the click (does not trigger the underlying page turn/menu).

### 2.3. Header Update
-   Add a Help button (icon) to the right side of the `ReaderHeader`.

## 3. Technical Implementation Strategy

### 3.1. Event Handling Updates
**File:** `src/pages/EpubReader/services/renditionEvent.service.ts`
-   Update the `click` listener to pass the `event` object up the chain.
    ```typescript
    props.rendition.on('click', (e: Event) => {
        if (props.onClick) props.onClick(e);
    });
    ```

**File:** `src/pages/EpubReader/hooks/useEpubReader.ts`
-   Update types to accept `(e: MouseEvent) => void` for `onClick`.

### 3.2. Reader View Logic
**File:** `src/pages/EpubReader/index.tsx`
-   **State:** Add `showHelp` (boolean).
-   **`onClickReaderView`:**
    -   Accept `event`.
    -   Calculate zones.
    -   Execute `onPrev()`, `onNext()`, or `setMenuVisible(!menuVisible)`.
    -   *Crucial:* This replaces the old behavior which just dismissed menus.

### 3.3. Selection Service Refinement
**File:** `src/pages/EpubReader/services/selection.service.ts`
-   Review `extractSelectionToWords`.
-   Ensure it validates that the `anchorNode` or `focusNode` of the selection is actually a text node or within a text-containing element.
-   If the selection is "empty space" (whitespace only) or implies a "snap-to-nearest" behavior that we want to avoid, return `null` to prevent the Context Menu from stealing focus.

### 3.4. UI Components
-   **New Component:** `src/pages/EpubReader/components/ReaderHelpOverlay.tsx`
-   **Update:** `src/pages/EpubReader/components/ReaderHeader.tsx` to include the button.

## 4. User Stories
1.  **Reading Navigation:** As a user, I want to tap the left/right edges of the screen to turn pages without accidentally highlighting text.
2.  **Menu Access:** As a user, I want to tap the center of the screen to access the menu.
3.  **Learning UI:** As a new user, I want to click a help button to see where I should tap for different actions.

## 5. Roadmap
1.  **Phase 1:** Refactor `renditionEvent.service` and `useEpubReader` to pass click events.
2.  **Phase 2:** Implement `ReaderHelpOverlay` and Header button.
3.  **Phase 3:** Implement Zone Logic in `EpubReader/index.tsx` and refine `selection.service.ts` to ignore false-positive selections.
