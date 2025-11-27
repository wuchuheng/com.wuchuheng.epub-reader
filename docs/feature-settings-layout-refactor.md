# Settings Layout Refactor

## Objective
- Replace the card grid on `/settings` with a two-panel layout: left navigation rail (General, Context Menu, About), right content panel that switches with route.
- Preserve deep links like `/settings/contextmenu` while making settings navigation consistent and discoverable.

## Scope
- Files: `src/config/router.tsx`, `src/pages/SettingsPage/index.tsx`, `src/pages/ContextMenuSettingsPage/index.tsx`, new components under `src/pages/SettingsPage`.
- Add two new page bodies: `General` (placeholder/coming soon) and `About` (app name, short intro, version tag).
- Keep Context Menu functionality intact; only move it into the new layout shell.
- No backend or data model changes.

## Current State
- `/settings` renders a cards grid with a single active entry (Context Menu) and a "Coming Soon" list.
- `/settings/contextmenu` is a standalone page with its own `Container` and breadcrumb trail.
- There is no About/General page; navigation between settings areas is not persistent.

## UX & Layout Requirements
- Two-column layout on desktop: fixed-width left rail (approx 240px) with section links; right pane scrolls independently.
- Left rail:
  - Items: General, Context Menu, About (in this order).
  - Use `NavLink` to highlight the active route; include subtle hover state.
  - On small screens, collapse to a top horizontal list or accordion above the content (no horizontal scroll overflow).
- Right pane:
  - Shows the active section content; padding consistent with existing Container spacing.
  - Header area includes the section title and a short description where applicable.
- Breadcrumb/back:
  - Keep existing breadcrumb trail from `Container`, but consolidate so the layout wrapper owns it (children do not render their own Container).

## Routing Changes
- Convert `/settings` to a parent layout route with nested children:
  - `/settings` -> redirect/index to `/settings/general`.
  - `/settings/general` -> new General page body.
  - `/settings/contextmenu` -> existing Context Menu content (no path change).
  - `/settings/about` -> new About page body.
- Ensure legacy direct links to `/settings/contextmenu` still work and show the nav active state.
- Provide a catch-all under `/settings/*` that redirects to `/settings/general`.

## Component Structure
- Add `SettingsLayout` (e.g., `src/pages/SettingsPage/SettingsLayout.tsx`) that:
  - Wraps `Container` and renders the two-column shell.
  - Reads child route via `Outlet`.
  - Accepts a nav config array `{ label, description?, path }` to drive the left rail.
- Update `SettingsPage/index.tsx` to export the General page body (no Container; uses layout spacing only).
- Move Context Menu page to export only its content block; remove nested Container/breadcrumb duplication and slot it into `SettingsLayout`.
- Add `AboutPage` (or similar) under `src/pages/SettingsPage/AboutPage.tsx`:
  - Shows app name, one-paragraph description, and a version tag (derive from `package.json` version or a constant).
  - Include links to docs/issue tracker if available, or keep simple copy.

## Visual/Styling Notes
- Tailwind utility targets:
  - Left rail: `bg-white`, border-right, `min-h-full`, `space-y-1`, `text-sm`. Active item uses `bg-blue-50 text-blue-700 border border-blue-100`.
  - Right pane: `bg-white`, `shadow`, `rounded-lg`, `p-6`, matches current settings aesthetic.
  - Mobile: stack nav above content with `md:flex-row` breakpoints; items become pills or full-width buttons.
- Keep typography consistent with existing pages (font sizes from current settings cards).

## Accessibility
- Use semantic `nav` for the rail with `aria-label="Settings sections"`.
- `NavLink` items should set `aria-current="page"` automatically via `NavLink`.
- Ensure focus outlines are visible on the rail and action buttons inside sections.
- Maintain keyboard navigation for drag-and-drop in Context Menu list (existing behavior).

## Acceptance Criteria
- Navigating to `/settings` shows the General section by default and highlights General in the rail.
- Clicking rail items updates the URL and swaps the right pane without full-page reload.
- Visiting `/settings/contextmenu` directly shows the new layout with Context Menu highlighted and its content intact.
- Visiting `/settings/about` shows app name, intro copy, and a version pill.
- Breadcrumb/back button still returns to Home -> Settings, and the layout uses a single Container wrapper (no double headers).
- Responsive: rail collapses/stacked on narrow viewports; content remains readable without horizontal scroll.
