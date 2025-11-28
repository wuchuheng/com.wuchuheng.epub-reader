import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as OPFSManager from '../../services/OPFSManager';
import { formatFileSize } from '../../utils/epubValidation';
import { useAppDispatch } from '../../store';
import { loadBooks } from '../../store/slices/bookshelfSlice';

type ResetState = 'idle' | 'working' | 'success' | 'error';

export const StoragePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [stats, setStats] = useState<OPFSManager.OPFSStorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetState, setResetState] = useState<ResetState>('idle');
  const opfsSupported = OPFSManager.isSupported();

  const loadStats = useCallback(async () => {
    if (!opfsSupported) {
      setError('OPFS is not supported in this browser.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await OPFSManager.getStorageStats();
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load storage details.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [opfsSupported]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const configSize = useMemo(() => {
    if (!stats) return 0;
    const config = stats.entries.find(
      (entry) => entry.kind === 'file' && entry.path === 'config.json'
    );
    return config?.size ?? 0;
  }, [stats]);

  const booksSize = useMemo(() => {
    if (!stats) return 0;
    return stats.entries
      .filter((entry) => entry.kind === 'file' && entry.path.startsWith('books/'))
      .reduce((sum, entry) => sum + entry.size, 0);
  }, [stats]);

  const fileEntries = useMemo(() => {
    if (!stats) return [];
    return stats.entries
      .filter((entry) => entry.kind === 'file')
      .sort((a, b) => b.size - a.size);
  }, [stats]);

  const handleResetAll = async () => {
    if (!opfsSupported) {
      setResetState('error');
      setError('OPFS is not supported in this browser.');
      return;
    }

    const confirmed = window.confirm(
      'This will delete all locally cached books and settings in OPFS. The action cannot be undone. Continue?'
    );
    if (!confirmed) return;

    try {
      setResetState('working');
      setError(null);
      await OPFSManager.resetAllData();
      await dispatch(loadBooks());
      await loadStats();
      setResetState('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset local data.';
      setResetState('error');
      setError(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Storage</h3>
        <p className="text-sm text-gray-600">
          Review locally cached OPFS files and reset everything when needed.
        </p>
      </div>

      {!opfsSupported && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Your browser does not support OPFS. Switch to a Chromium-based browser to manage cached
          files.
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total cached</p>
          <p className="text-2xl font-semibold text-gray-900">
            {stats ? formatFileSize(stats.totalBytes) : '--'}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Books</p>
          <p className="text-2xl font-semibold text-gray-900">
            {stats ? formatFileSize(booksSize) : '--'}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Config</p>
          <p className="text-2xl font-semibold text-gray-900">
            {stats ? formatFileSize(configSize) : '--'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h4 className="text-base font-semibold text-gray-900">Cached files</h4>
            <p className="text-sm text-gray-500">Files stored in OPFS with their sizes.</p>
          </div>
          <span className="text-xs text-gray-500">
            {isLoading ? 'Loading...' : `${fileEntries.length} items`}
          </span>
        </div>
        <div className="divide-y">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500">Loading storage details...</div>
          )}
          {!isLoading && fileEntries.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">No cached files found.</div>
          )}
          {!isLoading &&
            fileEntries.map((entry) => (
              <div key={entry.path} className="flex items-center justify-between px-4 py-3">
                <div className="text-sm text-gray-800">{entry.path}</div>
                <div className="text-sm font-medium text-gray-900">
                  {formatFileSize(entry.size)}
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-base font-semibold text-red-800">Danger zone</h4>
            <p className="text-sm text-red-700">
              Resetting removes all local data: every cached book file, cover image, and the config
              file. This cannot be undone.
            </p>
          </div>
          <button
            onClick={handleResetAll}
            disabled={resetState === 'working' || !opfsSupported}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resetState === 'working' ? 'Resetting...' : 'Delete all cached data'}
          </button>
        </div>
        {resetState === 'success' && (
          <p className="mt-2 text-sm text-green-800">Local data cleared successfully.</p>
        )}
        {resetState === 'error' && (
          <p className="mt-2 text-sm text-red-800">Failed to reset local data.</p>
        )}
      </div>
    </div>
  );
};

export default StoragePage;
