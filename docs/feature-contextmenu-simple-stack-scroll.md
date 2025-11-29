# Context Menu Simple Stack Scroll Spec

> Note: Word/sentence default selection has been replaced by single-word and multi-word support flags.

## Goal
- In simple mode, show every enabled tab (iframe + AI) inside one shared scroll container so users can read all results by
  scrolling, with the active tab indicator updating as they move.
- Preserve existing features (parallel loading, streaming, drilldown, stacked windows, runtime reset on close) while
  giving a one-page summary view and an inline way to open the full chat for the current AI tool.

## Current Behavior
- Context menu shows one tab at a time; tabs toggle visibility (`absolute` panes). Parallel loading keeps other panes
  running, but the user only sees the active tab.
- AI simple mode renders only the latest assistant message, hides the role label, removes the “end” notice, and pins
  scroll to the top. A floating pen button opens conversation mode; the input bar opens only after clicking it.
- Iframe panes fill their container but live in their own tab. Each pane height matches the tab viewport, not a stacked
  list.
- Tab strip highlights only the clicked tab. Default tab selection follows `defaultFor`/first-enabled logic.

## Desired Experience
- Simple mode becomes a stacked view:
  - All enabled tabs render in order inside one scrollable container; users can keep scrolling from the current tab into
    the next/previous content without clicking the strip.
  - The initial scroll position shows the default tab (per existing `defaultFor`/first-enabled rules); the user can
    scroll to other tabs naturally.
  - The bottom tab strip reflects the tab whose section is currently in view; clicking a tab scrolls to its section.
  - Streaming/iframe loads stay parallel; stacked windows still work, and closing any window cancels its own streams.
- Section sizing:
  - Iframe sections use the measured body height as a min-height so the frame fills the viewport even with little
    content.
  - AI sections are not height-limited; text flows naturally while keeping the latest-assistant-only simple rendering
    (no role label, no “end” notice, scroll starts at top).
- Chat entry:
  - Remove the floating pen button in simple mode.
  - Add a chat icon to every AI usage bar (next to copy). Clicking it switches that AI tool to full conversation mode
    and focuses the input for that tab; other tabs stay available via the strip.
- Conversation mode reuses the existing single-tab layout (one pane visible, input bar shown). Closing the input (X)
  returns to the stacked simple view at the same scroll position.
- If usage metadata is missing, provide a small inline chat control in the AI panel so conversation remains reachable.
- Honor user-defined default tab (tool config) as the initial section; the stacked view still starts on that tab even
  though all sections render.
- Tabs & defaults:
  - Default tab logic remains unchanged; the stacked view just scrolls to that section on mount/remount.
  - Tab clicks in simple view scroll; in conversation view they continue to switch panes as today.
- Constraints retained: drilldown still works inside AI text, streaming continues in background, runtime resets and HTTP
  aborts when a window closes, click-outside closes the whole stack.

## State & Layout Plan
- Add a simple-view layout mode in `ContextMenu`: `viewLayout = 'stackedSimple' | 'tabbedConversation'`.
  - Start in `stackedSimple` when opening the menu; switch to `tabbedConversation` when any AI tab enters conversation,
    and switch back when closing conversation.
  - Keep per-tab `tabIndex` for active indicator; drive it from scroll position in stacked mode and from user clicks in
    conversation mode.
- Body container:
  - Replace the current absolute pane wrapper with two render paths:
    - Stacked: a single `overflow-y-auto` container with sequential sections.
    - Tabbed: current absolute panes.
  - Measure the available body height (window height minus header+tab bar) via a ref/ResizeObserver; pass it to sections
    as `minHeight` (iframe only).
- Section headers:
  - Each section shows its tab name at the top in title sizing with an underline so users know which tab they are
    viewing in the stacked scroll.
- Active tab detection:
  - Use IntersectionObserver or scroll math (section top/bottom vs container scrollTop) to set `tabIndex` when a section
    crosses a threshold (e.g., center of the viewport) to avoid jitter.
  - Tab strip click scrolls to the matching section (smooth scroll) when in stacked mode; in conversation mode it just
    switches panes.
- AI panels:
  - Keep existing `AIAgent` streaming logic. Simple view renders the latest assistant message only; conversation view
    uses the full list with the input bar.
  - Expose a callback to flip an AI tab into conversation view and bubble up to `ContextMenu` to enter
    `tabbedConversation`.
  - When leaving conversation, restore the stacked layout and scroll to the AI tab section so context is preserved.
- Iframe panels:
  - Keep current URL substitution and loading logic; add `minHeight` equal to body height so the frame fills the section.

## Implementation Outline
1) Layout mode + sizing
   - In `ContextMenu`, track `viewLayout`, compute body `minHeight`, and render stacked vs tabbed bodies accordingly.
   - Build stacked sections for every enabled tab with shared scroll container and section refs for scroll/IO tracking.
2) Tab sync
   - Implement active tab detection from scroll position and smooth scroll on tab click in stacked mode.
   - Preserve existing tab switching logic in conversation mode.
3) AI controls
   - Remove the pen FAB in simple mode.
   - Add a chat icon to `AIStatusBar`; wire it to trigger conversation for that tab. Provide a fallback chat trigger when
     usage is absent.
   - Ensure closing the input returns to stacked view and restores scroll; keep streaming/cached content intact.
4) Sizing
   - Pass `minHeight` to iframe sections based on measured body height; allow AI sections to grow naturally without a
     height cap.
   - Keep scroll position stable for the currently viewed section while streaming/iframe loading progresses (e.g., use
     resize observers to adjust scrollTop when above-section heights change, and avoid anchor shifts). Ensure updates do
     not yank the user’s viewport even when multiple AI tools stream.
5) Compatibility
   - Keep drilldown callbacks, streaming, parallel loading, stacked context-menu windows, default tab selection, and
     runtime abort on close. Do not alter iframe/AI request limits.

## Edge Cases & QA
- Empty tools: still block/alert when no enabled tab. Single-tab case should still scroll but active tab stays fixed.
- Switching defaults: new selection scrolls to the new default section and remounts panes via `selectionId`.
- Conversation exit: verify it restores stacked mode and active tab highlighting correctly.
- Manual QA: scroll through multiple tabs (AI + iframe), confirm active tab updates, chat icon opens conversation for
  that AI tab, iframe height fills the viewport, click-outside closes all windows, drag/maximize still works, and the
  current section does not jump while content streams.
