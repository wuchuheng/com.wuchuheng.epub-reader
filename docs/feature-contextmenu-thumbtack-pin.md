# Context Menu Thumbtack Pin Spec

## Goal
- Add a thumbtack control in the context-menu header to pin the window in maximized state and signal that default.
- Allow header double-click toggling between normal and maximized when the pin is not locked.
- Hide the minimize/restore affordance when the pin is active to avoid conflicting controls.

## Current Behavior
- Window supports normal and maximized states via header buttons; default open is normal, centered at 40rem with clamps.
- Maximize/restore button is always visible; there is no pinned default or visual indicator for locked max size.
- Double-click on the header does nothing; the header only handles drag when not maximized.

## Thumbtack Control
- Visible only when the window is maximized and window-size changes are not externally locked.
- Use `BsPin` from `react-icons/bs` for the thumbtack icon with two visual states:
  - Pinned: deep gray background with a white pin glyph to emphasize the locked state and "always open maximized".
  - Unpinned: transparent background, uses existing hover focus styles and dark pin glyph.
- Clicking toggles pin state; when pinned, the window stays maximized and reopens maximized.
- When pinned, hide the maximize/restore button (mini button) and disable drag/restore interactions.
- If window-size is locked (new guard flag), the thumbtack is not rendered.

## Maximize/Restore Icon Update
- Use distinct icons for the maximize toggle: outward diagonal arrows when in normal mode, inward diagonal arrows when
  maximized to signal scaling back down.
- Use `HiMiniArrowsPointingOut` for maximize and `HiMiniArrowsPointingIn` for restore from `react-icons/hi2` with existing
  button styling and aria-labels.
- When the thumbtack hides the maximize control, the inward/outward icon swap is not shown.

## Double-Click Toggle
- Double-click on header empty space (outside buttons) toggles between normal and maximized when size is not locked. The
  pin prevents restoring while locked-on-max but does not block maximize from a normal state.
- Ignore double-click events on controls or the centered title; only the header background should trigger the toggle.
- Reuse existing maximize/restore handlers so clamping and restore layout logic stay consistent.

## State & Persistence
- Track `isPinnedMaximized` in component state.
- Persist the preference in OPFS config (`contextMenu.pinnedMaximized`, default false) so reopen/new selections honor the
  choice across reloads.
- On open, if pinned preference is true, start in maximized state immediately and skip drag setup until unpinned.
- Store and restore normal size/position exactly as today for unpinned sessions.

## Control Layout & Access
- Keep a single control cluster with OS-aware ordering:
  - macOS: controls on the left ordered as close, maximize/restore, pin.
  - Windows/others: controls on the right ordered as pin, maximize/restore, close.
- Buttons retain focus-visible outlines and `aria-label`s; add labels for thumbtack states (Pin window, Unpin window).
- Colors stay inline via Tailwind classes; thumbtack gray uses the same gray token as existing hover backgrounds.

## Edge Cases & QA
- Resizing the viewport while pinned keeps the window maximized; restore clamps to viewport when unpinned.
- Opening on a small viewport clamps size but keeps pin state and hides restore when pinned.
- Verify: pin on/off persistence across reload, pin hides restore, unpin shows restore, double-click only when allowed,
  drag disabled while pinned.
- Confirm tab switching and stacked/tabbed conversation layouts are unaffected; footer buttons remain reachable.
- Backdrop close continues to work regardless of pin state.

## Open Questions
- Clarify the trigger for "window size is locked": should it come from an external prop or a settings toggle? The spec
  assumes a boolean guard to hide the thumbtack and double-click when size changes are disallowed.
