# Spec: Context Menu Display Mode (Stacked vs. Tabbed)

## 📋 Overview
Currently, the Context Menu in Immersive Reader operates in a "Stacked" (Auto Scroll) mode where all active tools are rendered in a single scrollable container. Clicking a tab in the footer scrolls the corresponding tool into view. 

This enhancement introduces a "Tabbed" (Switch) mode where only one tool is visible at a time. Users can toggle between these modes in the Context Menu settings.

## 🎯 Goals
- Add a global setting to choose between "Stacked" and "Tabbed" display modes for the Context Menu.
- Implement the "Tabbed" mode in the `ContextMenu` component.
- Ensure a smooth transition and consistent UX between both modes.

## 🛠 Proposed Changes

### 1. Data Model Updates (`src/types/epub.ts`)
- Add `displayMode` property to `ContextMenuSettings` type.
```typescript
export type ContextMenuSettings = {
  // ... existing properties
  displayMode?: 'stacked' | 'tabbed';
};
```

### 2. Constants (`src/constants/epub.ts`)
- Add `DEFAULT_DISPLAY_MODE: 'stacked'` to `DEFAULT_CONFIG`.

### 3. Settings Management (`src/pages/ContextMenuSettingsPage/hooks/useContextMenuSettings.ts`)
- Update the hook to handle `displayMode`:
  - Initialize with default value.
  - Add `updateDisplayMode` action.
  - Ensure it's persisted in OPFS.

### 4. Settings UI (`src/pages/ContextMenuSettingsPage/index.tsx`)
- Add a new section or update "General Settings" to include a Display Mode selector.
- Use a segmented control or toggle with labels:
  - **Auto Scroll (Stacked):** "All tools in one scrollable view."
  - **Switch (Tabbed):** "Show one tool at a time."

### 5. Context Menu Logic (`src/pages/EpubReader/components/ContextMenu.tsx`)
- Update `ContextMenuProps` to include `displayMode`.
- Modify the rendering logic in `ContextMenu`:
  - **In `stacked` mode (default):** Keep current behavior (scroll spy, all items rendered, scroll-into-view on tab click).
  - **In `tabbed` mode:**
    - Only render the `item` corresponding to `tabIndex`.
    - Disable scroll spy logic.
    - Floating scroll buttons should still work for the active item if its content overflows.
    - Ensure `AIAgent` and `IframeRender` receive the correct height and context.

### 6. Internationalization (`src/i18n/locales/en/settings.json` & `zh-CN/settings.json`)
- Add translations for the new setting and its options.

## 🧪 Verification Plan
- **Manual Testing:**
  - Toggle between Stacked and Tabbed modes in settings.
  - Verify that in Stacked mode, clicking tabs scrolls to the section.
  - Verify that in Tabbed mode, clicking tabs replaces the content with the new tool.
  - Ensure AI responses and iframes load correctly in both modes.
  - Test on different screen sizes (mobile vs. desktop).
- **Regression Testing:**
  - Ensure existing features like pinned maximization and AI response caching still work as expected.
