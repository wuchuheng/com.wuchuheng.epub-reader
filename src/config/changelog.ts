import { type ChangelogVersion } from '../types/changelog';

const changelogV1_0_0: ChangelogVersion = {
  version: '1.0.0',
  releasedAt: '2025-11-29',
  summary: 'Major context menu drilldown, reader navigation zones, and settings redesign for the 1.0.0 release.',
  changes: {
    feat: [
      {
        title:
          'Context menu drilldown with stacked windows, drag-to-move chrome, and simple view switching for nested AI queries.',
      },
      {
        title: 'Reader interaction zones with help overlay and protected selections for smoother navigation.',
      },
      {
        title: 'Context menu settings redesign with tool enable switches, defaults, and drag-and-drop layout.',
      },
      {
        title: 'Storage overview with cache reset plus improved About and settings shell.',
      },
      {
        title: 'AI provider dropdown with caching, default tools, and a global default model selector.',
      },
      {
        title: 'Simplified uploads, icon upload button, and mobile volume key navigation on the bookshelf.',
      },
    ],
    fix: [
      {
        title: 'Prevented selection zone conflicts and stale text selection in the reader.',
      },
      {
        title: 'Centered popup titles in context menu UI elements.',
      },
    ],
    refactor: [
      {
        title: 'Removed unused code and refreshed loading component styling.',
      },
      {
        title: 'Updated settings tag styling for consistency.',
      },
    ],
    docs: [
      {
        title: 'Consolidated contributor guidelines into AGENTS.md and refreshed AI rules.',
      },
      {
        title: 'Updated README to reflect recent capabilities.',
      },
    ],
    chore: [],
    perf: [],
    style: [],
  },
};

export const CHANGELOG_CONFIG: ChangelogVersion[] = [changelogV1_0_0];
export const LATEST_CHANGELOG = CHANGELOG_CONFIG[0];
