# Context Menu Tool Enable Switch Spec

> Note: Word/sentence default selection has been replaced by single-word and multi-word support flags.

## Goals
- Let users disable individual AI or iframe tools without deleting them.
- Ensure disabled tools never appear or auto-open in the reader context menu.
- Preserve existing ordering/default behaviors for enabled tools with predictable fallbacks.

## Current Behavior & Pain Points
- All tools stored in `ContextMenuSettings.items` render as tabs in the reader overlay (`src/pages/EpubReader/components/ContextMenu.tsx`).
- The default tab is chosen per selection situation in `EpubReader/index.tsx`, falling back to index 0 even if the tool is unwanted.
- Settings UI (`ContextMenuSettingsPage` + Tool add/edit flows) has no notion of an enabled state; removing a tool is the only way to hide it.

## Functional Requirements
1) Add an `enabled` flag to both AI and iframe tools (default `true`).
2) Disabled tools:
   - Do not render in the reader context menu tab strip or content.
   - Are ignored when picking the default tab for a selection; if a disabled tool was marked default, fall back to the next eligible enabled tool.
3) Settings UI:
   - Tool list rows show a switch for all tools to toggle enabled/disabled.
   - Add/edit AI tool forms include an "Enabled" switch (default on).
   - Add/edit iframe tool forms include an "Enabled" switch (default on).
   - When a tool is switched off, its `defaultFor` is cleared and default checkboxes are disabled until re-enabled.
4) Persistence:
   - `ContextMenuSettings` saves the `enabled` flag to OPFS config.
   - Migration sets `enabled: true` for existing tools lacking the flag and seeds defaults in `menuItemDefaultConfig`.
5) Empty/edge cases:
   - If no enabled tools remain after filtering, do not open the context menu; surface a gentle notice (alert/toast) instructing the user to enable a tool in settings.

## UX Notes
- Switch style: simple pill/slider (Tailwind-based) sized similarly to Ant Design switch, with clear on/off labels.
- Tool list row: place the switch near the type chip so status is visible at a glance; show a muted "Disabled" tag when off.
- Form placement: place the switch near the name inputs as a global state for the tool.

## Data Model & Validation
- Types: extend `AISettingItem` and `IframeSettingItem` with `enabled?: boolean`.
- Validation rules:
  - New tools default to `enabled: true`.
  - Disabled tools cannot be saved as default; clearing happens automatically on toggle-off.

## Reader Behavior
- Active tools list = all tools where `enabled !== false`.
- Default tab selection:
  1. First active tool whose `defaultFor` matches the selection situation.
  2. Else the first active tool in the list.
- Tab switching operates on the filtered active list; indices are derived from that list to avoid gaps.

## Manual Test Plan
- Add AI tool with switch on → appears in context menu and respects defaults.
- Toggle existing AI tool off in the list → disappears from context menu; defaults fall back to the next active tool.
- Toggle existing iframe tool off → disappears from context menu.
- Toggle off a tool marked as default → default clears; next selection opens the next active/default tool.
- Add tool with switch off via form → saved as disabled; not shown in context menu until re-enabled.
- Disable all tools → selecting text shows no context menu and displays the notice.
