# Spec: Iframe Tool Height Fix

## 1. Issue Analysis

### 1.1. Problem Description

When the Context Menu is set to "Switch" (Tabbed) mode, iframe-based tools fail to expand and fill the full height of the menu's content area. In contrast, AI-based tools function correctly, leading to an inconsistent and suboptimal user experience where a large blank space is left unused.

### 1.2. Root Cause

The issue is located in `src/pages/EpubReader/components/ContextMenu.tsx` and stems from two different height calculation methods being used for different types of tools.

- **AI Tools (`AIAgent`):** These components correctly receive a dynamic `containerHeight` prop. This value is calculated using a `ResizeObserver` that measures the actual available space, ensuring the component fills the content area in both "Stacked" and "Tabbed" modes.

- **Iframe Tools (`IframeRender`):** These components are passed a `minHeight` prop with a hardcoded pixel value. This calculation is specifically designed for "Stacked" mode, where it creates a fixed-size container that allows other tools in the list to be partially visible.

This static, pixel-based height is incorrectly applied even when the menu is in "Tabbed" mode. The `IframeRender` component's container is therefore constrained to this fixed height, preventing it from expanding to fill its parent, which has `height: 100%`.

## 2. Proposed Solution

The solution is to apply conditional logic within `ContextMenu.tsx` to ensure `IframeRender` receives the appropriate height for the active display mode.

### 2.1. File to Modify

- `src/pages/EpubReader/components/ContextMenu.tsx`

### 2.2. Implementation Steps

1.  **Introduce a Conditional Height Variable:** A new variable, `iframeHeight`, will be defined within the `ContextMenu` component.
2.  **Apply Logic:**
    - If `displayMode` is `'tabbed'`, `iframeHeight` will be set to `'100%'`.
    - If `displayMode` is `'stacked'`, `iframeHeight` will be set to the existing calculated pixel-based height (e.g., `'350px'`).
3.  **Update Prop:** The `minHeight` prop passed to the `<IframeRender />` component will be updated to use this new `iframeHeight` variable.

### 2.3. Code Snippet

This demonstrates the change within the `ContextMenu.tsx` component:

```typescript
// src/pages/EpubReader/components/ContextMenu.tsx

const ContextMenu: React.FC<ContextMenuProps> = (props) => {
  // ... existing component logic ...

  const contentMinHeight = Math.max(windowSize.height - 163, 200);

  // In 'tabbed' mode, the iframe should fill the container.
  // In 'stacked' mode, it uses a fixed height to allow other items to "peek".
  const iframeHeight = displayMode === 'tabbed' ? '100%' : `${contentMinHeight}px`;

  // ... existing logic ...

  return (
    // ... JSX ...
          <IframeRender
            key={`${paneKey}-${iframeRefreshKey}`}
            url={item.url}
            words={props.words}
            context={props.context}
            // The 'minHeight' prop is used to set the style 'height'.
            // This change correctly passes either '100%' or a pixel value.
            minHeight={iframeHeight}
            preResolvedUrl={iframeUrl}
          />
    // ... JSX ...
  );
};
```

## 3. Verification Plan

- **Tabbed Mode:** Manually verify that when an iframe tool is selected, it expands to use the full height of the content area.
- **Stacked Mode:** Manually verify that the behavior in stacked mode is unchanged. Iframe tools should retain their fixed height, and scrolling should work as before.
- **No Regressions:** Confirm that resizing the context menu window and switching between modes does not introduce new issues for any tool type.
