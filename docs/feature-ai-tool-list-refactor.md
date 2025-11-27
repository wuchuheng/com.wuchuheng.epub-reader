# Custom AI Tools List UI Refactor

## Objective
- Simplify the custom tools list so each row shows only the tool name, tool type, and action controls while keeping reorder/edit/remove flows intact.

## Scope
- Update `src/pages/ContextMenuSettingsPage/components/ToolList.tsx` and any small styling hooks in `ContextMenuSettingsPage`.
- Preserve existing data model (`ContextMenuItem`, `AISettingItem`, `IframeSettingItem`) and list behaviors (reorder, edit, remove).
- No changes to add/edit forms, storage, or API configuration.

## Current State (Baseline)
- Each item renders name, type pill, shortcut, model/prompt or iframe URL details, reasoning badge, plus Edit/Remove buttons and drag handle.
- List supports drag-and-drop reordering; empty state message already present.

## Desired Experience
- Compact row layout with three visible columns: name, type badge, actions.
- Hide prompt/model/url/shortcut/reasoning chips from the list view.
- Keep drag handle available but visually lightweight to maintain reorder affordance.
- Actions: primary "Edit" and secondary "Remove" buttons; confirm remove via existing handler (no modal change).
- Align items for quick scan (table-like spacing on desktop, stacked on mobile).

## Interaction & Behavior Requirements
- Drag-and-drop ordering still works with keyboard and pointer sensors.
- Clicking "Edit" navigates to existing route `/settings/contextmenu/{index}/edit`.
- "Remove" triggers `onToolRemove(index)`; no behavior change to callbacks.
- Empty state text stays functionally the same; adjust copy only if spacing requires.
- Loading/error handling remains in `ContextMenuSettingsPage` (no change).

## Visual/Responsive Notes
- Desktop: single-row layout with left-aligned name, centered type pill, right-aligned actions + drag handle.
- Mobile: stack name and type on first line; place actions beneath with adequate touch targets.
- Maintain existing color palette, spacing, and rounded corners consistent with current settings page.

## Accessibility
- Preserve `aria-label` on drag handle; ensure focus order reaches Edit, Remove, drag handle.
- Buttons keep text labels; contrast should match current design tokens.

## Acceptance Criteria
- Each list item shows only name, type badge, action buttons, and drag handle—no prompt/model/url/shortcut/reasoning text.
- Reordering, editing, and removing work as before for both AI and iframe tools.
- Layout remains readable on narrow viewports without horizontal scroll.
- Empty list still surfaces a friendly message guiding users to add a tool.
