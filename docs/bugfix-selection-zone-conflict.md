Bugfix: Selection Blocks Interaction Zones

## Context
- Reader uses smart interaction zones: left/right for page turns, middle toggles global menu.
- Text selection should suppress these zones so selection mode and zone toggles stay mutually exclusive.

## Problem
- After selecting text, the zone click handler still saw the click event and toggled the global menu.
- The suppression relied on `lastSelectionTimeRef` being updated only when the debounced selection callback fired, leaving a timing gap where the click was still treated as a zone interaction.

## Changes
- Added an immediate `onSelectionActivity` hook in `useReader` to record selection intent before the debounced handler runs.
- Wired `EpubReader` to pass `markSelectionActivity`, updating `lastSelectionTimeRef` as soon as selection starts so the zone handler ignores the subsequent click.

## Resulting Behavior
- Selecting text (mouse or touch) now updates the selection timestamp immediately.
- The smart zone click handler detects recent selection activity and no longer toggles the global menu or other zone actions during selection.
- Context menu visibility remains stable; it only appears when explicitly triggered by the selection flow, not by the zone handler.

## Validation
- Ran `pnpm lint` (pass).
- Manual check recommended: select text and verify the global menu does not toggle from the zone handler; clicking outside selection should still toggle as expected when not selecting.
