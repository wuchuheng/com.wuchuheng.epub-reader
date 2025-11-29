# Feature Specification: Context Menu Selection Support

## 1. Objective
Let each context-menu tool declare whether it supports single-word selections, multi-word selections, or both. Tools that do not support the current selection length are hidden from the menu.

## 2. Data Model
- `ContextMenuItem` now exposes two booleans:
  - `supportsSingleWord` (default: true)
  - `supportsMultiWord` (default: true)
- Legacy `defaultFor` flags are removed; no automatic default tab selection remains beyond the first supported tool.

## 3. Settings UI (`/settings/contextmenu`)
- **Tool list**: Show two checkboxes (“Single-word”, “Multi-word”) to control support per tool. Switches are smaller; Edit/Remove use icon buttons.
- **Add/Edit forms**: Replace the old word/sentence default radios with the same two support checkboxes. Validation requires at least one checkbox to be selected.

## 4. Reader Logic
- On selection, compute word count:
  - 1 word → show tools with `supportsSingleWord`.
  - More than 1 word → show tools with `supportsMultiWord`.
- If no enabled tools support the selection, prompt the user to enable the relevant support in settings.
- The initial tab is always the first supported tool.

## 5. Persistence
- OPFS defaults seed both support flags to true.
- Loading settings strips any legacy `defaultFor` and normalizes support flags, enforcing at least one to stay true.
