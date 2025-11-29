# Context Menu Backdrop Close (Topmost Only)

## Goal
- Restore the original behavior where clicking outside stacked context menus only closes the foremost window.
- Preserve stacking and drilldown flows so parent windows stay open until explicitly dismissed.

## Current Behavior
- Backdrop clicks call a close-all handler, clearing the entire context menu stack in one action.
- Users cannot peek at lower-level windows without fully dismissing every window at once.

## Target Behavior
- Backdrop click on the visible (topmost) context menu closes only that menu; lower windows remain.
- When only one window is open, the backdrop closes it as before.
- Closing a menu via header controls still removes that menu and its descendants to respect the runtime boundary.

## Implementation Notes
- Add an `isTopMost` flag to each rendered `ContextMenu` instance to identify which window owns the active backdrop.
- Replace the backdrop handler with a guard that only fires when `isTopMost` is true, and call the existing `onClose`
  path so descendants are removed with their parent.
- Remove the close-all prop and rely on the stack order (`zIndex` increments) to ensure only the foremost backdrop
  receives pointer events.
- Keep existing tab/index resolution and drilldown behaviors unchanged.

## QA Checklist
- Open two context menus (base + drilldown); click outside once → only the top window closes; click again → the next
  window closes.
- With a single window open, backdrop click closes it.
- Header close still removes the targeted window and any children.
- Dragging/resizing and tab switching behave the same as before.
