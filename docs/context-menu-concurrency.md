# Context Menu AI Concurrency Specification

## Overview
- Add a configurable concurrency limit for AI requests triggered from context menu tools.
- Default limit: 2; minimum allowed value: 1.
- Applies to all AI calls made by context menu tools; iframe tools are unaffected.

## Data Model & Defaults
- Add `maxConcurrentRequests?: number` to `ContextMenuSettings`.
- Introduce `DEFAULT_MAX_CONCURRENT_REQUESTS = 2` in `src/constants/epub.ts`.
- Seed default in `buildDefaultContextMenuSettings()` and merge through `applyConfigDefaults`, `getContextMenuSettings`,
  and `updateContextMenuSettings` to keep legacy configs working.
- Clamp any loaded or saved value below 1 back to 1; fall back to default when missing.

## Settings UI
- Add a numeric input on the Context Menu Settings page under the General card:
  - Label: “Max concurrent AI requests”.
  - `min=1`, default display 2, clamp to ≥1 on change/save.
  - Helper text: explains it limits simultaneous LLM calls; extra calls queue until a slot is free.
- Wire to state via a new `updateMaxConcurrentRequests` helper in `useContextMenuSettings`.
- Localize label and helper text in `en` and `zh-CN` settings locales.

## Concurrency Manager
- Create `src/services/aiRequestQueue.ts` with a promise-based queue keyed by API base URL
  (empty string uses a default key).
- API shape requested:
  - `const ticket = await queue.wait(limit);`
  - Always call `ticket.done()` after the request finishes (success, error, or abort).
- Behavior:
  - Respects per-key limit passed to `wait`; limit is provided by the current setting.
  - FIFO ordering for waiters.
  - Releases slots on completion or abort to avoid deadlocks.

## Runtime Integration
- Thread `maxConcurrentRequests` from settings through:
  - `ContextMenuComponent` → `AIAgent` → `useFetchAIMessage`.
- In `useFetchAIMessage`:
  - Acquire a queue ticket right before constructing the OpenAI client and firing the request.
  - Call `done()` in `finally` so queued tasks unblock on any outcome.
  - Keep cache checks before acquiring a slot to avoid holding capacity unnecessarily.
- Scope queue by `api` (base URL); changing API uses the queue for the new key automatically.

## Edge Cases
- Missing or invalid settings use default 2; runtime clamp ensures limit ≥1.
- Abort handling still releases the slot.
- Works across multiple AIAgent instances; they share the queue when pointing to the same API URL.

## Verification (manual)
- Set limit to 1, trigger two AI tools at once: first starts, second waits until `done()` from the first.
- Set limit to 2, trigger three concurrent requests: two run, one waits, then starts after a slot frees.
- Confirm setting persists after reload and respects min=1.
- Smoke existing flows: context menu opens, AI responses stream, regeneration still works, max-selected-words guard unchanged.
