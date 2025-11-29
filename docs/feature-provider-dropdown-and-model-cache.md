# Provider Dropdown + Per-Provider Default Model Spec

## Goals
- Remove search/filter behavior from the API provider selector; present a simple option list only.
- Store and restore the default model per provider (like API keys) so switching providers never reuses another
  provider's model.

## Current Behavior
- Provider selector uses `SearchableSelect`, allowing free-text filtering and showing only one list instance.
- `defaultModel` is a single string shared across all providers; switching providers keeps the previous provider's model
  instead of clearing/restoring per provider.
- Only API keys are cached per provider via `providerApiKeyCache`.

## Proposed Changes
- Provider dropdown
  - Replace the searchable select with a plain option list (no filtering, no inline typing).
  - Keep the current labeling, helper text, and docs link behavior; only interaction changes.
  - Adjust dropdown positioning so it opens upward when near the viewport bottom (or chooses the larger available space)
    to ensure the option list has enough height to unfold.
- Default model caching per provider
  - Add `providerDefaultModelCache: Partial<Record<AiProviderId, string>>` to `ContextMenuSettings`.
  - `defaultModel` represents the value for the currently selected provider only; when the provider changes, set it from
    the cache or to an empty string if none exists.
  - When the default model input changes, write both `defaultModel` and the cache entry for the active provider.
  - Remove any fallback that carries a previous provider's model into a newly selected provider; empty is valid until
    the user sets it.
- UX rules
  - Switching providers updates Base URL + API key as today, and also swaps the default model from cache (or blanks it).
  - Save guard remains: if AI tools exist, the user must provide a default model for the active provider before saving.
  - Example: choose provider Foo and set default model "foo model" (cached); switch to provider Bar and set "bar model"
    (cached); switch back to Foo and see "foo model" restored automatically.

## Data Model & Persistence
- Update `ContextMenuSettings` defaults/builders (`OPFSManager`) to include `providerDefaultModelCache` seeded as `{}`.
- On load: derive `defaultModel` from `providerDefaultModelCache[providerId] ?? ''`; keep migration that seeds a default
  model from the first AI tool or legacy global string, and write it into the cache for the current provider. Do not
  apply any hardcoded fallback such as `gpt-3.5-turbo`.
- On save: persist both `defaultModel` (for compatibility) and `providerDefaultModelCache`.

## Component Impact
- `ApiConfig`: swap `SearchableSelect` usage for a non-filterable select (reuse styles where possible).
- `useContextMenuSettings`: handle model cache read/write on provider changes; set `defaultModel` to cached value or
  empty string.
- `ModelSearchInput`: consume the passed `defaultModel` value; no behavior change besides being fed cleared values when
  a provider has no cached model.
- Types: extend `ContextMenuSettings` and any derived props with the new cache field; keep `defaultModel` for current
  provider only.

## Migration Notes
- For existing configs with a single `defaultModel`, populate `providerDefaultModelCache[currentProviderId]` with that
  value so users keep their current default on first load; other providers start empty.
- Ensure configs missing `providerId` still infer `custom` and seed caches accordingly.

## QA Checklist
- Dropdown near the bottom of the viewport opens upward (or picks the direction with more space) and shows a comfortably
  tall option list.
- Switching providers swaps API key and default model independently; providers without a cached model show an empty
  default model input.
- Provider dropdown no longer filters when typing; options remain visible as a simple list.
- Saving with AI tools requires a default model for the active provider; saving without one blocks with a clear warning.
- Reload after saving: selected provider, API key, and default model all restore from their respective caches.
