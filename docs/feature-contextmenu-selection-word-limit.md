# Context Menu Selection Word Limit Spec

## Goal
- Allow users to cap the number of selected words that trigger context menu tools.
- Default limit: **10,000 words**. Selections above the limit are blocked and users see a brief flash message styled like Ant Design message (top-center, auto-hide ~5s).

## Current Behavior
- Selection flow lives in `selection.service.ts` → `useContextMenuState.pushBaseMenu/pushDrilldownMenu`.
- Menu creation only guards against empty selections and unsupported single/multi-word tools; there is no length cap.
- User feedback for blocked actions currently relies on alerts in `useContextMenuState`.

## Scope
- Add a configurable max selected word count to context menu settings (persisted in OPFS).
- Update settings UI to edit the limit.
- Enforce the limit for both base selections and drilldowns.
- Show a non-blocking flash message when the limit is exceeded.

## Data Model & Persistence
- Add `maxSelectedWords: number` to `ContextMenuSettings`.
- Default value set in `buildDefaultContextMenuSettings` to 10000.
- Load/save/migrate through `getContextMenuSettings`/`updateContextMenuSettings` and `useContextMenuSettings`:
  - If missing or invalid, fall back to the default.
  - Clamp to a reasonable range (e.g., 1–50000) during save.

## Settings UI
- Location: Context Menu Settings page.
- Control: Labeled numeric input “Max selected words” with helper text “Selections over this limit will be blocked.”
- Behavior: Accepts positive integers only; invalid input reverts to the last valid value (or default on first load).
- Persistence: Uses existing save flow; no extra buttons beyond the current Save Settings.

## Enforcement
- Use `getWordCount` on the trimmed selection string.
- Check the limit before creating menu entries in:
  - Base selection (`pushBaseMenu` path).
  - Drilldown selections (`pushDrilldownMenu` path).
- If over the limit:
  - Do not create or mutate the menu stack.
  - Trigger the flash message (see UX below).
- Under the limit: existing single/multi-word support checks remain unchanged.

## Flash Message UX
- Style: Ant Design message-like toast pinned top-center; small shadow, rounded white/neutral background, clear text.
- Content: “Selection exceeds the max word limit. Reduce your selection to continue.”
- Duration: Auto-dismiss after ~5s; repeated triggers refresh the timer instead of stacking.
- Accessibility: `aria-live="polite"`; non-blocking overlay (no modal/backdrop).
- Implementation: Reusable lightweight flash/toast helper (portal-based) to avoid pulling full AntD.

## Edge Cases & QA
- Desktop and mobile selection flows both honor the limit.
- Very large selections should not crash or open menus; only the flash message appears.
- Drilldown respects the same limit.
- Persistence verified: custom limit survives reload; default applies when unset.
- Regression: single/multi-word support behavior unchanged for valid selections.
