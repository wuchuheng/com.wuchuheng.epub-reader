# Context Menu Configuration Redesign Spec

## Goals
- Make the two mental models obvious: **AI provider setup** vs **custom tool list**.
- Reduce cognitive load by grouping fields, surfacing status/context where it belongs, and clarifying actions.
- Keep the page compact, readable, and responsive without adding new dependencies.

## Pain Points in Current UI
- All controls live in one vertical stack; provider details, model, status, and tools visually blend together.
- Connection status sits far from the action that triggers it; success/error looks the same as neutral.
- Tool list lacks grouping cues; actions (edit/remove/reorder) visually compete with tool names.
- Save action is far from the areas being configured and can scroll out of view.

## Proposed Information Architecture
- Page shell stays the same; inside the main card, split content into two primary sections:
  1) **Provider & Authentication** (left/top) — provider selection, API key, base URL (when relevant), default model, connection state.
  2) **Custom AI Tools** (right/below) — tool list, creation, ordering, scopes.
- On desktop, use a two-column grid: Provider card (min 360px) on the left; Tools card stretches on the right.
- On mobile, stack the cards with consistent spacing and a sticky bottom action bar.

## Layout & Visual Treatment
- Section wrappers: lightly tinted backgrounds (`bg-slate-50` or `bg-sky-50`) with 1px border and 12–16px radius to separate groups.
- Each section gets a header row with a title + short helper line and an inline status chip (for provider only).
- Use clear dividers between field clusters (provider select/key/model) and actions (Test, Save).
- Keep primary actions sticky: a bottom bar anchored to the card that holds `Save Settings` and `Test Connection`.

## Provider & Authentication Card
- Header: "AI Provider" + secondary text "Connect your model provider for AI tools".
- Fields (top to bottom):
  - Provider select (combobox) with inline helper text showing the selected provider’s base URL/docs.
  - Conditional Base URL (only for custom/preset that requires edit).
  - API Key input with visibility toggle.
  - Default Model input (reuse ModelSearchInput) with subtle label "Used by AI tools unless overridden".
- Status row: a pill to the right of the header showing `Testing / OK / Warning / Error` with color-coded background.
- Test action: secondary button "Test connection" aligned under fields; result appears inline in the card, not below the tools.
- Error copy: concise, actionable text with a "View docs" link when available.

## Custom AI Tools Card
- Header: "Custom AI Tools" with short helper "Shown in reader context menu".
- Controls bar:
  - Primary `Add Tool` button.
  - Optional search/filter input for larger lists (future-friendly).
  - Drag handle hint label ("Drag to reorder") so the affordance is clear.
- Tool rows:
  - Card rows with subtle hover state and left accent bar (e.g., `border-l-4 border-blue-200`).
  - Layout: Name + type chip on the left; scope checkboxes centered; actions (Edit, Remove, drag) right-aligned with quieter styles.
  - Keep destructive action red but lighter; make Edit the primary inline action.
- Empty state: icon + short message "No tools yet" + `Add Tool` button.

## Actions & Flows
- Primary save: sticky bar with `Save Settings` (primary) and `Cancel`/`Reset` (secondary link) anchored at the bottom of the main card.
- Save feedback: inline toast or text chip within the bar ("Saved", "Failed to save").
- Testing flow: clicking "Test connection" sets the status chip to `Testing…`, then updates to OK/Warning/Error; avoids scrolling to find feedback.

## Content & Microcopy
- Provider helper: "Select a provider. For custom OpenAI-compatible services, enter the base URL."
- Model helper: "Default model for all AI tools. Override per tool in its edit screen."
- Tool helper: "Tools appear in the reader context menu in this order."
- Status messages: concise, action-first ("Missing API key", "Endpoint unreachable — check base URL").

## Responsive & Interaction Notes
- Desktop: two-column grid (`grid-cols-[380px,1fr]` or similar). Sticky footer spans both columns.
- Mobile: single column, cards stacked with 16–20px gap; sticky footer remains pinned with safe-area padding.
- Keyboard: Tab order respects section grouping; drag handles remain keyboard-accessible via up/down buttons or move controls.

## Implementation Notes (for future work)
- Reuse existing `ApiConfig`, `ModelSearchInput`, and `ToolList` logic; wrap them inside layout cards rather than rewiring behavior.
- Promote status rendering into the Provider card header area; keep API test logic unchanged.
- Add a shared `SectionCard` wrapper for consistent padding, border, and header layout across both sections.
- Sticky action bar can live in `ContextMenuSettingsPage` so state remains centralized.

## Open Questions
- Should per-tool model overrides surface inline in the list, or stay inside the edit screen?
- Do we add a "Preview menu" mini-panel to show how the tools will appear in the reader?
