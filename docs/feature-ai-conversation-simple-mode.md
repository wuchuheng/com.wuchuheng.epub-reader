# AI Conversation Simple Mode Spec

## Goal
- Add a dual-mode view for AI tools: default to a simple view that only shows the latest assistant reply, with an easy
  switch to the full conversation log when the user wants to chat.
- Keep all existing AI capabilities (streaming, prompt templating, reasoning content, model/usage info, conversation
  input) intact.
- Use the existing pen icon as the mode toggle: pen opens conversation mode from simple mode and should also bring the
  input box into view; closing the input returns to simple mode without losing state.

## Current Behavior
- Each AI tool renders the full chat log by default, including the initial user prompt and every assistant reply.
- The pen icon toggles the input bar open or closed; when closed the conversation remains visible but read-only.
- Conversations reset per selection/context-menu runtime cycle; closing the menu aborts streams and drops state.
- Parallel tool loading is already in place: AI panes stay mounted while hidden and keep streaming in the background.

## Problems to Solve
- Long transcripts dominate the pane when users only want the latest AI answer.
- Opening the input bar currently expands controls but does not simplify the view; the full log is always shown.

## Desired Experience
- Default to a compact/simple mode that highlights only the most recent assistant response for that AI tool.
- Provide a clear control to expand into the full conversation view; reuse the existing conversation affordance instead
  of adding a second button.
- When expanded, show the full history exactly as today and auto-open the input box so the user can start typing
  immediately.

## Modes and Transitions
- Simple mode (default for every AI tool each time the context menu opens or a new selection creates a new
  `selectionId`):
  - Render via a dedicated "latest message" component that shows only the newest assistant message for that tool
    (include streaming updates, errors, usage, and model labels as they arrive).
  - Hide the full message list and input UI; keep the existing pen icon visible to enter conversation mode.
  - If no assistant message exists yet (still fetching), show the in-progress or empty state in this compact area.
- Conversation mode:
  - Show the full message list exactly as current behavior.
  - Auto-open the input bar on entry (no extra click) and keep all send and streaming behavior unchanged.
  - The pen icon (or Back to summary/close) collapses back to simple mode without losing the ongoing stream or history.
- Mode state is per tool within the current runtime cycle: switching tabs preserves the mode for that tool; closing the
  overlay or changing selection resets to simple mode for all tools.
- Switching modes must not remount or refetch; reuse the same underlying message state and stream to avoid duplicate API
  calls.
- When in simple mode, the scroll position should stay at the top (no auto-scroll to bottom); switching to conversation
  mode can restore the existing bottom-aligned behavior.

## UI/Layout Notes
- Simple mode layout should be compact: a single message container that stretches to fill the pane height and handles
  markdown, reasoning snippet, usage/model info, and error text. No scroll bar clutter from prior messages.
- Keep streaming visible in simple mode (text grows as chunks arrive); if aborted or error, show the inline error text
  in that same area.
- Keep inactive panes mounted and hidden per the parallel-load spec (no `display: none`; use opacity and
  pointer-events).

## Edge Cases
- If the user opens conversation mode mid-stream, continue the same stream and append future turns to history.
- If the overlay closes, abort streams and drop state as already specified; reopening starts in simple mode.
- If there is no assistant reply yet (for example, request failed before any content), show a friendly Awaiting AI
  response placeholder with the conversation button visible to retry or continue.

## Current Implementation Summary
- Simple mode renders only the latest assistant reply via a dedicated component, hides the role label, and keeps scroll
  at the top without the "You've reached the end" notice.
- Conversation mode preserves the full chat log and bottom-aligned auto-scroll, with the pen icon opening the input and
  the close icon returning to simple mode without remounting or refetching.
- Parallel loading and per-selection reset still apply: panes stay mounted while hidden, streams abort on overlay close,
  and new selections remount panes with fresh state.
