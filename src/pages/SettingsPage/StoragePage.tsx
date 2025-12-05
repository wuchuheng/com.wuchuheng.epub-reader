import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as OPFSManager from '../../services/OPFSManager';
import { formatFileSize } from '../../utils/epubValidation';
import { useAppDispatch } from '../../store';
import { loadBooks } from '../../store/slices/bookshelfSlice';

type ResetState = 'idle' | 'working' | 'success' | 'error';

export const StoragePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('settings');
  const [stats, setStats] = useState<OPFSManager.OPFSStorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetState, setResetState] = useState<ResetState>('idle');
  const opfsSupported = OPFSManager.isSupported();

  const loadStats = useCallback(async () => {
    if (!opfsSupported) {
      setError(t('storage.notSupported'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await OPFSManager.getStorageStats();
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('storage.error');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [opfsSupported, t]);

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
      setError(t('storage.notSupported'));
      return;
    }

    const confirmed = window.confirm(
      t('storage.resetConfirm')
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
      const message = err instanceof Error ? err.message : t('storage.danger.error');
      setResetState('error');
      setError(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{t('storage.title')}</h3>
        <p className="text-sm text-gray-600">{t('storage.description')}</p>
      </div>

      {!opfsSupported && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          {t('storage.notSupported')}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">{t('storage.cards.total')}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {stats ? formatFileSize(stats.totalBytes) : '--'}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">{t('storage.cards.books')}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {stats ? formatFileSize(booksSize) : '--'}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">{t('storage.cards.config')}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {stats ? formatFileSize(configSize) : '--'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h4 className="text-base font-semibold text-gray-900">{t('storage.table.title')}</h4>
            <p className="text-sm text-gray-500">{t('storage.table.description')}</p>
          </div>
          <span className="text-xs text-gray-500">
            {isLoading
              ? t('storage.table.loadingLabel')
              : t('storage.table.items', { count: fileEntries.length })}
          </span>
        </div>
        <div className="divide-y">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500">{t('storage.table.loading')}</div>
          )}
          {!isLoading && fileEntries.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">{t('storage.table.empty')}</div>
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
            <h4 className="text-base font-semibold text-red-800">{t('storage.danger.title')}</h4>
            <p className="text-sm text-red-700">{t('storage.danger.description')}</p>
          </div>
          <button
            onClick={handleResetAll}
            disabled={resetState === 'working' || !opfsSupported}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resetState === 'working'
              ? t('storage.danger.action.working')
              : t('storage.danger.action.default')}
          </button>
        </div>
        {resetState === 'success' && (
          <p className="mt-2 text-sm text-green-800">{t('storage.danger.success')}</p>
        )}
        {resetState === 'error' && (
          <p className="mt-2 text-sm text-red-800">{t('storage.danger.error')}</p>
        )}
      </div>
    </div>
  );
};

export default StoragePage;
