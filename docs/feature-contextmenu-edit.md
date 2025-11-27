# Feature Specification: Context Menu Tool Editing

## 1. Background & Problem
The context menu settings page only allowed inline editing inside the list. This made the experience cramped on smaller screens and inconsistent with the dedicated “Add New Tool” flow.

## 2. Goals
- Provide a dedicated edit route and screen that mirrors the “Add New Tool” layout.
- Keep inline list simple by showing a concise summary with clear “Edit” and “Remove” actions.
- Persist edits via the existing OPFS-backed settings API.

## 3. User Experience
### 3.1 List Page (`/settings/contextmenu`)
- Each tool is shown as a card with name, type badge, short name, and a compact summary (model/prompt for AI, URL for iframe).
- Actions: `Edit` (navigates to edit page), `Remove`, and drag handle for reordering.
- The “+ Add New Tool” entry remains and still points to the add route.

### 3.2 Edit Page (`/settings/contextmenu/:id/edit`)
- Layout and form fields mirror the Add New Tool page: type selector, name, optional short name, and type-specific fields (AI prompt/model/reasoning or iframe URL).
- Pre-fills form state from the selected tool; invalid IDs show an error with a “Back to settings” button.
- Actions: `Cancel` (back to settings) and `Save Changes` (persists and returns to the list).
- Keyboard: `Esc` cancels; `Ctrl/Cmd+Enter` saves.

## 4. Technical Implementation
- **Routing:** Added `/settings/contextmenu/:id/edit` in `src/config/router.tsx` pointing to new `ToolEditPage`.
- **New Page:** `src/pages/ToolEditPage/index.tsx` reuses the add-tool form components and Container/breadcrumb shell; loads tool by index from settings and calls `saveTool`.
- **State Hooks:**
  - `useToolForm`: added `loadTool` to hydrate form state from an existing tool.
  - `useContextMenuSettings`: enhanced `addTool` to persist immediately; added `saveTool` to update a tool by index with error/saving state.
- **List UI:** `src/pages/ContextMenuSettingsPage/components/ToolList.tsx` now renders summary cards with Edit/Remove/drag actions; inline form editing was removed. The settings page wiring was simplified accordingly.
- **Add Page:** `ToolExtractPage` uses the updated `addTool` return value and cleans up effect deps.

## 5. Data Flow
- Both add and edit pages call into `useContextMenuSettings`, which writes through to OPFS via `updateContextMenuSettings`. Local state is kept in sync after persistence.

## 6. Testing Notes
- `pnpm lint` currently reports unrelated existing warnings in EpubReader hook dependency arrays. No new lint errors were introduced by this feature.
