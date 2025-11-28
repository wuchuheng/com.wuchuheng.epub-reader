# Context Menu Window Chrome Spec

## Goal
- Add a window-style header to the context-menu overlay with close + maximize/restore controls and drag-to-move support.
- Respect OS conventions: close button on the right for Windows, on the left for macOS; maximize/restore grouped with it.
- Preserve all existing overlay behaviors (parallel AI/iframe loading, simple/conversation modes, runtime reset on close).

## Current Behavior
- Overlay is centered in the reader, sized to 40rem square with max width/height limits and no draggable area.
- Closing happens by clicking the backdrop; there is no in-window chrome, maximize, or explicit close affordance.
- Position and size reset every time the overlay opens; tab switching only changes the active pane.

## Problems
- Users cannot move the window to avoid covering selected text or other UI.
- No explicit close/maximize controls; the only close target is the backdrop.

## Desired Experience
- Header bar spans the top of the window; body/tabs fill the remaining space.
- OS-aware control placement:
  - macOS: controls aligned left (close first, then maximize/restore). Windows/other: controls aligned right.
  - Buttons use inline SVG icons, no external assets or fonts.
- Controls:
  - Close triggers the existing `onClose` logic (so streams/iframes abort and runtime state resets).
  - Maximize fills the viewport within existing padding (respect the current outer margins).
  - Restore returns to the last normal size/position.
- Dragging:
  - Header acts as the drag handle when not maximized; pointer down starts drag, move updates position, release stops it.
  - Window cannot be dragged outside the visible viewport; keep at least a small margin visible.
  - Dragging is per runtime cycle: closing the overlay or new selection resets to centered defaults.

## State & Layout Rules
- Track `windowState: 'normal' | 'maximized'` plus `position` (top/left) for normal state.
- Default: center the normal window with the existing 40rem width/height and current max constraints.
- When maximizing, store the previous normal position/size to restore later; disable dragging while maximized.
- Body layout remains flex column: header fixed height, content area grows/shrinks accordingly; tabs stay at the bottom.

## Implementation Outline
- `ContextMenu.tsx`:
  - Manage an inner window positioned via `style` top/left instead of relying on `justify-center`; keep the backdrop
    covering the reader and closing on backdrop click.
  - Add header bar with OS-aware control alignment; icons are inline SVGs with hover/focus states.
  - Add state for `windowState` and `position`, derived from viewport size; update on maximize/restore and window resize.
  - Implement drag handlers on the header (pointer down/up/move listeners on `window` to avoid losing events).
  - When closing, reuse existing `onClose` so AI streams/iframe loads cancel per the runtime-cycle rule.
- Accessibility:
  - Buttons have `aria-label` values (Close window, Maximize, Restore).
  - Keyboard: Enter/Space activate buttons; Esc still closes via existing backdrop handler if supported.

## Edge Cases & QA
- On macOS detection failure, fall back to Windows-style right-aligned controls.
- Verify dragging stops when the pointer leaves the window or on touch devices (pointer cancel).
- Confirm maximize respects viewport changes (resize observer or window resize listener re-applies bounds).
- Manual: open overlay, drag to corners, maximize/restore, switch tabs, close via header and backdrop, ensure AI/iframe
  streams still cancel on close and positions reset on reopen.
