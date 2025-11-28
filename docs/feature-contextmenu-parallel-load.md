# Context Menu: Parallel Tool Load Spec

## Goal
- Load every enabled AI and iframe tool at the same time when the context menu opens after a text selection.
- Keep the tab strip for navigation while allowing each tool to run concurrently so switching tabs is instant.

## Current State (code)
- `src/pages/EpubReader/index.tsx` filters enabled tools, picks a default tab per selection situation, and stores the
  selection in `contextMenu` state.
- `src/pages/EpubReader/components/ContextMenu.tsx` refetches settings via `getContextMenuSettings`, filters enabled
  tools again, and renders only the active tab (AI or iframe). Switching tabs remounts components; only one tool runs at
  a time.
- `src/pages/EpubReader/components/AIAgent/components/MessageList/MessageList.tsx` sends the first AI request on mount
  and uses `hasFetchedInitiallyRef` to prevent re-fetching without a remount.
- Settings and enabled flags live in `src/pages/ContextMenuSettingsPage/hooks/useContextMenuSettings.ts` and
  `src/services/OPFSManager.ts`; the reader also uses the hook, so the overlay reloading settings is redundant.

## Problems
- Only the active tab loads; other tools stay idle until clicked, so the requirement to load all tools together is not
  met.
- `ContextMenu` pulls its own settings, which can drift from the already loaded `useContextMenuSettings` state in the
  reader.
- To run tools in parallel we must ensure AI agents and iframes reset when a new selection arrives without expensive
  unmount/remount cycles on tab switches.

## Refined Behavior (parallel + persistent)
- On text selection, the overlay receives the current settings and a new `selectionId`; every enabled tool (AI + iframe)
  starts immediately with the provided `words`/`context`.
- Tabs only toggle visibility; panes stay mounted so AI streaming and iframe loading continue in the background.
- A new selection remounts all panes (keyed by `selectionId`) to refresh prompts/URLs; tab switching never destroys
  running tools.
- A runtime cycle equals one open context-menu session: caches only live while the overlay is open; closing it destroys
  in-memory data and cancels active HTTP/stream connections. Reopening starts fresh.
- Default-for logic in the reader still chooses the initially focused tab; tab indices are derived from the filtered
  enabled list.
- A new `selectionId` is created only when the user changes the text selection; tab switches never change it. All panes
  remount when `selectionId` changes to force fresh AI prompts/iframe URLs.

## Implementation Plan
1) Share settings down
   - Extend `ContextMenuProps` to accept `items`, `api`, `apiKey`, `defaultModel`, and a `selectionId`.
   - In `src/pages/EpubReader/index.tsx` keep `activeTools` from `useContextMenuSettings`, add a `selectionId` that
     increments per selection, and pass settings directly to `ContextMenuComponent` instead of refetching OPFS.
2) Render all panes
   - Refactor `src/pages/EpubReader/components/ContextMenu.tsx` to drop the `getContextMenuSettings` call and consume
     the active items from props.
   - Derive `resolvedModel` per AI tool (global default → tool override → fallback) and render a pane for every item.
   - Keep panes mounted and toggle visibility via CSS (`hidden`/`block`) so work continues off-tab.
   - Set pane `key` to `${selectionId}-${index}` to remount all tools when the user makes a new selection, ensuring fresh
     AI prompts and iframe loads.
3) Tool components
   - Ensure `AIAgent` resets per selection (key or `selectionId` prop) so `MessageList` initializes once and auto-starts
     the fetch for that selection; keep message state mounted across tab switches to reuse cached responses.
   - `IframeRender` already recomputes its URL from props; the pane key forces a reload per selection. Use visibility
     styles (not unmount) for inactive tabs.
4) Fallbacks and guards
   - If `activeTools` is empty, keep the existing alert and skip rendering the overlay.
   - Validate `tabIndex` against the filtered list; if out of range fall back to the first enabled tool. Default tab
     selection stays in the reader’s selection handler.
5) QA
   - Manual: select text with multiple AI and iframe tools enabled and confirm all panes start loading immediately while
     tab switching is instant.
   - Verify default-for logic, enable/disable toggles, and that a new selection resets every pane.

## Decisions
- Parallel AI calls stay unlimited; all enabled AI tools start concurrently per selection.
- Background streaming stays active; switching tabs only changes visibility. The input box behavior stays as-is (pen icon
  to open the textarea), and conversations keep streaming in background panes.
- Runtime cycle equals one open overlay: when the context menu closes, cancel all in-flight HTTP/stream requests and
  drop cached state; reopening or the next selection starts fresh.
- Default tab logic remains as implemented: use tool `defaultFor` for word/sentence when set; otherwise pick the first
  enabled tool.
- No new tab badges/spinners; keep the current UI. Inactive iframes stay mounted and continue loading; hide them with
  non-destructive styles (e.g., `absolute inset-0 opacity-0 pointer-events-none aria-hidden="true"`, not `display:
  none`).

## Additional Guidance
- Closing the overlay must abort AI streams (AbortController or client cancel) and stop iframe loads; per-tool state is
  discarded on close.
- Background errors should surface inline in their pane even if the tab was inactive; no global badges.
