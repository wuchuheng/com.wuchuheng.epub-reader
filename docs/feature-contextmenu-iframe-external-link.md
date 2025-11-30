# Context Menu Iframe External Link

## Goal
- Keep the iframe section label visible in the sticky header, add direct open-in-new-tab, and make reload available
  without scrolling.

## Changes
- Sticky header now shows tool name plus two controls for iframe tools only:
  - Refresh button (`LuRefreshCcw`) remounts the iframe using the current resolved URL. Counters reset when the
    selection changes so a new excerpt starts fresh.
  - External-link button (`FaExternalLinkAlt`) opens the same resolved URL in a new tab with `noreferrer noopener`.
- Both buttons share the resolved URL (with words/context substitutions) used by the inline iframe; buttons disable
  when no usable URL is available.

## UX Notes
- Header stays sticky at the top of the section; tab strip and scroll container behavior are unchanged.
- Refresh uses a per-iframe key so the render fully reloads. Switching selections clears the counters.
- Loading and error overlays still cover only the iframe area; the header remains visible and usable.

## QA Checklist
- Open a context menu with iframe tools: header shows tool name plus refresh/link icons; inline frame still loads in
  the scroll container.
- Click the external-link icon: a new tab opens with the same content as the inline iframe.
- Click refresh: iframe content reloads; no effect on AI tabs.
- Error state still shows the failure message; header and buttons remain visible; buttons disabled when URL is empty.
- Works with multiple iframe tools and when switching tabs, maximizing, pinning, or stacked scroll mode.
