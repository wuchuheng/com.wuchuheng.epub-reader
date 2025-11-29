# Changelog Feature Specification

## Goal

- Add a maintainable changelog config with category buckets (feat, fix, refactor, docs, etc.).
- Surface the latest changelog inside the app so users can see what changed in the current release.
- Release version `v1.0.0` that captures all commits after tag `v0.0.10`.

## Inputs (v0.0.10..HEAD scan)

- Context menu upgrades: drilldown flows, stacked windows/simple view, enable switches, drag-to-move chrome.
- Reader improvements: interaction/click zones with help overlay, selection conflict fixes.
- Settings/UX: two-panel settings layout, redesigned context menu config UI, storage overview/reset, About page.
- AI tooling: provider dropdown with caching, default AI tools, global default model selector, iframe loading/error handling.
- Home/library: simplified upload, icon upload button, volume key navigation, message highlighting refinements.
- Maintenance: guideline/docs updates, UI tag/style tweaks, cleanup of unused code.

## Deliverables

- New config-driven changelog data source with typed categories per version.
- UI in Settings to display the latest changelog (and previous versions) without hardcoded copy.
- Version display in About page sourced from the changelog config instead of literals.
- Git tag `v1.0.0` created after changelog data is populated.

## Data Model

- Add `src/types/changelog.ts`:
  - `ChangelogCategory` union: `'feat' | 'fix' | 'refactor' | 'docs' | 'chore' | 'perf' | 'style'`.
  - `ChangelogEntry`: `{ title: string; description?: string; }`.
  - `ChangelogVersion`: `{ version: string; releasedAt: string; summary: string; changes: Record<ChangelogCategory, ChangelogEntry[]>; }`.
- Add `src/config/changelog.ts`:
  - Export `CHANGELOG_CONFIG: ChangelogVersion[]` sorted newest-first.
  - Export `LATEST_CHANGELOG` aliasing the first entry for easy import.
  - Seed with `v1.0.0` including categorized bullets derived from the history scan above.

## UI/UX Plan

- Create `ChangelogPage` under Settings with route `/settings/changelog`.
- Layout: hero section (version badge, release date, summary), followed by category cards (one per non-empty category) listing entries.
- Add "Previous versions" accordion/list fed from the same config for future releases (initially only v1.0.0).
- Update Settings navigation to include "Changelog" and keep About page to show app info.
- Update About page version chip to read from `LATEST_CHANGELOG.version` to avoid drift.

## Release Steps

- Update `package.json` version to `1.0.0` to align with the release tag.
- Populate `CHANGELOG_CONFIG` with `v1.0.0` data reflecting commits since `v0.0.10`.
- After code changes, create annotated tag `v1.0.0` at `HEAD` (message: "Release v1.0.0").

## Non-Goals

- Automated changelog generation from git.
- Persisting changelog to storage or remote sources.
