# Feature Specification: Global Default Model Selector

## 1. Objective
Centralize AI model selection on `/settings/contextmenu` with a single "Default Model" input (same searchable widget as the tool form) so all AI tools share one model. Remove the per-tool model picker from add/edit forms and have the reader use the global default model for AI requests.

## 2. Problem Statement
- Each AI tool currently requires a model to be set individually, which is repetitive and error-prone.
- Users want to set the provider endpoint/key once and pair it with a global model choice instead of configuring a model on every tool.
- The UI shows a model field inside each tool form, but there is no place to set a global default that all tools can inherit.

## 3. Scope
- Settings UI: `src/pages/ContextMenuSettingsPage` (page, forms, tool list).
- Hooks & state: `useContextMenuSettings`, `useToolForm`.
- Types & persistence: `src/types/epub.ts`, `src/services/OPFSManager.ts`, defaults in `src/config/config.ts`.
- Reader/runtime: `src/pages/EpubReader/components/ContextMenu.tsx` and AI UI components that display the active model.

## 4. UX & Requirements
- Add a "Default Model" field under API config on `/settings/contextmenu` using the existing `ModelSearchInput` component (searchable dropdown + manual entry).
- The input uses the API endpoint/key already entered to fetch models; shows default options if fetch fails (keep existing behavior).
- Helper copy: explain that all AI tools will use this model and per-tool overrides are no longer available.
- Remove the "Model" picker from AI tool add/edit forms (ToolEdit/Add, ToolExtract) and their shared form components.
- Save button persists the global model together with API endpoint/key and tools.
- Validation: warn/disable save if there are AI tools but no default model; otherwise allow empty (for iframe-only setups).

## 5. Data Model & Persistence
- `ContextMenuSettings`: add `defaultModel?: string`.
- `AISettingItem.model` becomes optional/deprecated in UI; keep type compatibility for legacy data.
- Persistence (`getContextMenuSettings` / `updateContextMenuSettings`) stores `defaultModel`.
- Migration on load:
  - If `defaultModel` is missing, derive it from the first AI tool’s `model` (if present), else fallback to `'gpt-3.5-turbo'` when AI tools exist.
  - Preserve existing `model` values for backward compatibility but do not surface them in the UI.
- Update default config (`menuItemDefaultConfig` and OPFS default settings) to include `defaultModel: ''`.

## 6. State Management Changes
- `useContextMenuSettings`:
  - Include `defaultModel` in state and provide `updateDefaultModel`.
  - Ensure `saveSettings` writes `defaultModel`.
  - When loading settings, run the migration logic above to populate `defaultModel` if absent.
- `useToolForm`:
  - Remove `toolModel` state and related setters/validation; AI tool creation no longer assigns `model`.
  - Loading an existing tool should ignore `model` (or store only for backward compatibility messaging if needed).

## 7. UI Component Updates
- `ContextMenuSettingsPage`: add a card/section for the global model field using `ModelSearchInput` wired to `defaultModel`.
- `AIToolForm` / `ToolForm`: remove the model input block; keep prompt, reasoning toggle, and default behavior radios.
- Adjust any props/types that expected `model` (e.g., remove `model` prop requirements when rendering `AIToolForm`).
- Update Tool Add/Edit pages and the Tool Extract flow to work without `model` in form state.

## 8. Runtime Behavior
- `ContextMenu` when launching `AIAgent` resolves model as:
  1) `settings.defaultModel`
  2) Legacy `tool.model` (for pre-migration data)
  3) Fallback `'gpt-3.5-turbo'`
- Pass the resolved model to `AIAgent`, `AIStatusBar`, and `AIMessageRender` so the displayed model matches the global default.
- No per-tool model selection remains in the reader UI; all AI tools run with the same resolved model.

## 9. Acceptance Criteria
- `/settings/contextmenu` shows a "Default Model" searchable input (same UX as the previous tool-level model picker) under API config.
- Adding or editing AI tools no longer shows a model field; prompts/reasoning/default behavior remain.
- Saving settings persists `defaultModel` to OPFS; reloading the page keeps the chosen value.
- Reader uses the global model for all AI tools; legacy configs without `defaultModel` still work via fallback logic.
- If API endpoint/key are set and reachable, model search pulls from the provider as before.
- Validation prevents saving when AI tools exist but `defaultModel` is empty (or surfaces a warning per UX decision).

## 10. Manual Test Plan
- Clean load with no settings: set endpoint/key, pick a default model, add an AI tool, save, refresh, and verify the model persists and appears in the reader.
- Legacy data: start with existing tools that have `model` values, load settings, confirm the default model is auto-filled from the first AI tool, and the reader still works.
- Negative: remove default model while AI tools exist and confirm the save flow warns or blocks per validation rule.
