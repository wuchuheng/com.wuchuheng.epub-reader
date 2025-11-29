export type ChangelogCategory = 'feat' | 'fix' | 'refactor' | 'docs' | 'chore' | 'perf' | 'style';

export interface ChangelogEntry {
  title: string;
  description?: string;
}

export interface ChangelogVersion {
  version: string;
  releasedAt: string;
  summary: string;
  changes: Record<ChangelogCategory, ChangelogEntry[]>;
}
