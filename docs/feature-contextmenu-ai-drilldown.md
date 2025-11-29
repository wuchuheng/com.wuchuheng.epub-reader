# Context Menu AI Drilldown Spec

> Note: Word/sentence default selection has been replaced by single-word and multi-word support flags.

## Goal
- Allow users to click any word inside an AI tool’s output and open a new context-menu window to query that word with
  full context.
- Keep the original context menu running; new windows stack on top and reuse the existing tool defaults, parallel
  loading, streaming, and runtime-cycle rules (cancel/collapse on close).

## Current Behavior
- Only text selected in the EPUB view launches the context menu. AI responses inside the menu are read-only.
- A single context-menu window exists per selection; closing it resets the runtime and cancels streams/iframes.
- AI tool panes support simple/conversation modes, but no inline actions to open new menus from their content.

## Desired Experience
- In any AI tool pane (simple view or full conversation), clicking a non-interactive word opens a new context-menu
  window centered above the current one; the original window stays visible underneath.
- The clicked word becomes the new `words` value. The context is built from the AI pane’s text with the clicked word
  wrapped in `<selected>...<\/selected>`.
- Default tab selection follows existing rules: use the tool marked `defaultFor` the word/sentence situation; otherwise
  use the first enabled tool.
- Each new window gets its own `selectionId` so AI and iframe panes remount cleanly; parallel loading and streaming stay
  active per window.
- Closing any window aborts its in-flight AI/iframe work. Closing a parent window also closes its stacked children to
  respect the runtime-cycle boundary.

## Context Extraction Rules
- Trigger on single click inside assistant messages. Ignore clicks on links, buttons, inputs, or selectable controls to
  avoid hijacking intentional interactions.
- Determine the word by placing a caret range at the click point (via `caretRangeFromPoint`/`caretPositionFromPoint`),
  expanding to word boundaries using the existing selection logic (letter/digit spans).
- Build `context` from the visible AI pane text:
  - Simple mode: use the latest assistant message only.
  - Conversation mode: use the full rendered transcript (user + assistant messages) in display order.
- Insert `<selected>` around the clicked word instance using the resolved range (pre/selected/post) to avoid tagging
  every occurrence.
- Preserve basic spacing/newlines from the rendered text; strip markdown artifacts so prompts receive clean text.
- Language scope: only English words trigger drilldown; clicks on non-English text are ignored.

## State & Stacking
- Maintain a stack of context-menu entries in the reader state: `{id, words, context, tabIndex, selectionId, parentId}`.
- Render one `ContextMenu` per entry with incremented z-index so newer windows sit above older ones; reuse existing
  window chrome (drag/maximize/close) per instance.
- On close: remove the targeted entry; if it has descendants, remove them too. Keep remaining windows untouched.
- When the base context menu closes (e.g., header close), clear the entire stack to reset the runtime.
- Backdrop clicks close only the topmost window; repeat to step down through the stack.

## Implementation Outline
- Add a drilldown callback to `AIAgent` → `MessageList` → `AIMessageRender`/`MarkdownRender` that fires `SelectInfo`
  when a word click resolves successfully.
- Create a shared helper (akin to `extractSelectionToWords`) that accepts a click event + container to derive `{words,
  context}` using the rules above.
- Plumb a new prop from `ContextMenu` to `AIAgent` for `onDrilldownSelect`, bubbling the resulting `SelectInfo` back up
  to the reader.
- In `EpubReader`, replace the single `contextMenu` state with a stack. Push a new entry on drilldown (inherit config +
  default tab computation), and render all entries with increasing z-index and existing sizing/positioning defaults.
- Ensure each `ContextMenu` instance keeps its own `selectionId` and aborts requests on unmount; backdrop clicks only
  close the topmost window.

## Edge Cases & QA
- No-op if the click cannot resolve a word or produces an empty selection.
- Streaming safety: capture the text snapshot at click time; continue streaming in both parent and child windows.
- Verify stacking: open multiple drilldowns, drag/resize/maximize each, close in different orders, and confirm surviving
  windows keep state.
- Confirm runtime rules hold: closing any window cancels its streams/iframes; closing the base clears all windows.
- Manual QA paths: simple vs conversation modes, clicks on list items/paragraphs/code blocks, links remain functional,
  default tab selection still follows `defaultFor` + first-enabled fallback.
