import { type ChangelogVersion } from '../types/changelog';

const changelogV1_1_0: ChangelogVersion = {
  version: '1.1.0',
  releasedAt: '2025-12-02',
  summary:
    'Multilingual UI, PWA install/fullscreen upgrades, preset books, and revamped storage plus context menu tooling.',
  changes: {
    feat: [
      {
        title:
          'Full internationalization with language switcher, translated UI copy, and updated product naming.',
      },
      {
        title:
          'Preset book downloads with hash-based dedupe, progress tracking, and bundled Heidi sample.',
      },
      {
        title:
          'Storage page rebuild with lazy directory tree, file detail/preview modals, and shallow OPFS listing.',
      },
      {
        title:
          'PWA install hook, refreshed icons, fullscreen/portrait handling, and clearer install state feedback.',
      },
      {
        title:
          'Context menu caching with stacked and parallel routing plus refreshed iframe and AI agent controls.',
      },
      {
        title:
          'Selection word limit enforcement with message notifications and settings toggles.',
      },
      {
        title:
          'Reader interaction refactor to separate click vs selection flows and add keyboard navigation hooks.',
      },
      {
        title: 'New logo assets and About page presentation updates.',
      },
    ],
    fix: [
      {
        title: 'Fixed PWA orientation defaults and install button state mismatches.',
      },
      {
        title:
          'Prevented reader click/selection conflicts and improved context menu scroll control placement.',
      },
    ],
    refactor: [
      {
        title:
          'Refined OPFS utilities with public array buffer conversion and preset book hash handling.',
      },
      {
        title:
          'Updated context menu state management with caching service and URL synchronization hooks.',
      },
    ],
    docs: [
      {
        title:
          'Added specs/wiki coverage for PWA updates, selection limits, storage revamp, and context menu routing.',
      },
      {
        title:
          'Documented preset books workflow and internationalization implementation.',
      },
    ],
    chore: [
      {
        title:
          'Removed unused files and refreshed lockfiles for new i18n and PWA tooling.',
      },
    ],
    perf: [],
    style: [
      {
        title:
          'Friendlier book card styling plus improved settings/About visuals with the new logo.',
      },
    ],
  },
};

const changelogV1_0_1: ChangelogVersion = {
  version: '1.0.1',
  releasedAt: '2025-11-30',
  summary:
    'Iframe tool enhancements with refresh/external controls, pinned window states, and integrated changelog settings.',
  changes: {
    feat: [
      {
        title: 'Sticky header with refresh and external-link buttons for iframe tools.',
      },
      {
        title:
          'Thumbtack control to pin context menu in maximized state (persisted in settings).',
      },
      {
        title: 'Double-click header toggle between normal/maximized modes.',
      },
    ],
    fix: [],
    refactor: [
      {
        title: 'Integrated changelog display directly into the About page.',
      },
      {
        title: 'Replaced dedicated ChangelogPage with enhanced AboutPage.',
      },
    ],
    docs: [],
    chore: [],
    perf: [],
    style: [],
  },
};

const changelogV1_0_0: ChangelogVersion = {
  version: '1.0.0',
  releasedAt: '2025-11-29',
  summary:
    'Major context menu drilldown, reader navigation zones, and settings redesign for the 1.0.0 release.',
  changes: {
    feat: [
      {
        title:
          'Context menu drilldown with stacked windows, draggable chrome, and simple view switching for nested AI.',
      },
      {
        title:
          'Reader interaction zones with help overlay and protected selections for smoother navigation.',
      },
      {
        title:
          'Context menu settings redesign with tool enable switches, defaults, and drag-and-drop layout.',
      },
      {
        title: 'Storage overview with cache reset plus improved About and settings shell.',
      },
      {
        title:
          'AI provider dropdown with caching, default tools, and a global default model selector.',
      },
      {
        title:
          'Simplified uploads, icon upload button, and mobile volume key navigation on the bookshelf.',
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

export const CHANGELOG_CONFIG: ChangelogVersion[] = [
  changelogV1_1_0,
  changelogV1_0_1,
  changelogV1_0_0,
];
export const LATEST_CHANGELOG = CHANGELOG_CONFIG[0];
