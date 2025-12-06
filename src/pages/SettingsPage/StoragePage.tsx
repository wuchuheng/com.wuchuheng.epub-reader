import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdChevronRight, MdDownload, MdExpandMore, MdInfo, MdVisibility } from 'react-icons/md';
import * as OPFSManager from '../../services/OPFSManager';
import type { OPFSDirectoryEntry } from '../../services/OPFSManager';
import { formatFileSize } from '../../utils/epubValidation';
import { useAppDispatch } from '../../store';
import { loadBooks } from '../../store/slices/bookshelfSlice';
import { FileDetailsModal } from './components/FileDetailsModal';
import { FilePreviewModal } from './components/FilePreviewModal';

type ResetState = 'idle' | 'working' | 'success' | 'error';
type ModalState = {
  type: 'detail' | 'preview' | null;
  file: OPFSDirectoryEntry | null;
};

export const StoragePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('settings');
  const [error, setError] = useState<string | null>(null);
  const [resetState, setResetState] = useState<ResetState>('idle');
  const [modalState, setModalState] = useState<ModalState>({ type: null, file: null });
  const [rootEntries, setRootEntries] = useState<OPFSDirectoryEntry[]>([]);
  const [childrenMap, setChildrenMap] = useState<Record<string, OPFSDirectoryEntry[]>>({});
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [loadingPaths, setLoadingPaths] = useState<Record<string, boolean>>({});
  const [pathErrors, setPathErrors] = useState<Record<string, string>>({});
  const opfsSupported = OPFSManager.isSupported();
  const [opfsSizeBytes, setOpfsSizeBytes] = useState<number | null>(null);
  const [opfsSizeStatus, setOpfsSizeStatus] = useState<ResetState>('idle');
  const [opfsSizeError, setOpfsSizeError] = useState<string | null>(null);
  const baseIconButtonClass = [
    'rounded p-2 text-gray-500 transition-colors',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  ].join(' ');
  const directoryToggleClass = [
    'flex items-center gap-1 rounded px-1 py-0.5 text-gray-700 transition-colors',
    'hover:bg-gray-100 focus-visible:outline focus-visible:outline-2',
    'focus-visible:outline-offset-2 focus-visible:outline-blue-500',
  ].join(' ');
  const retryButtonClass = [
    'rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-700 transition-colors',
    'hover:bg-red-50 focus-visible:outline focus-visible:outline-2',
    'focus-visible:outline-offset-2 focus-visible:outline-red-500',
  ].join(' ');

  const sortEntries = useCallback((entries: OPFSDirectoryEntry[]) => {
    const directories = entries
      .filter((entry) => entry.kind === 'directory')
      .sort((a, b) => a.name.localeCompare(b.name));
    const files = entries
      .filter((entry) => entry.kind === 'file')
      .sort((a, b) => a.name.localeCompare(b.name));
    return [...directories, ...files];
  }, []);

  const setLoadingForPath = useCallback((path: string, isPathLoading: boolean) => {
    setLoadingPaths((prev) => {
      const next = { ...prev };
      if (isPathLoading) {
        next[path] = true;
      } else {
        delete next[path];
      }
      return next;
    });
  }, []);

  const setErrorForPath = useCallback((path: string, message: string | null) => {
    setPathErrors((prev) => {
      const next = { ...prev };
      if (message) {
        next[path] = message;
      } else {
        delete next[path];
      }
      return next;
    });
  }, []);

  const loadDirectoryEntries = useCallback(
    async (path: string = '') => {
      if (!opfsSupported) {
        setErrorForPath(path, t('storage.notSupported'));
        return;
      }

      setLoadingForPath(path, true);
      setErrorForPath(path, null);

      try {
        const entries = await OPFSManager.listDirectoryEntries(path);
        const sorted = sortEntries(entries);

        if (path) {
          setChildrenMap((prev) => ({ ...prev, [path]: sorted }));
        } else {
          setRootEntries(sorted);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : t('storage.error');
        setErrorForPath(path, message);
      } finally {
        setLoadingForPath(path, false);
      }
    },
    [opfsSupported, setErrorForPath, setLoadingForPath, sortEntries, t]
  );

  useEffect(() => {
    loadDirectoryEntries('');
  }, [loadDirectoryEntries]);

  const handleResetAll = async () => {
    if (!opfsSupported) {
      setResetState('error');
      setError(t('storage.notSupported'));
      return;
    }

    const confirmed = window.confirm(t('storage.resetConfirm'));
    if (!confirmed) return;

    try {
      setResetState('working');
      setError(null);
      await OPFSManager.resetAllData();
      await dispatch(loadBooks());
      setChildrenMap({});
      setExpandedPaths(new Set());
      setPathErrors({});
      await loadDirectoryEntries('');
      setResetState('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('storage.danger.error');
      setResetState('error');
      setError(message);
    }
  };

  const handleCalculateOpfsSize = useCallback(async () => {
    if (!opfsSupported) {
      setOpfsSizeError(t('storage.notSupported'));
      setOpfsSizeStatus('error');
      return;
    }

    try {
      setOpfsSizeStatus('working');
      setOpfsSizeError(null);
      const stats = await OPFSManager.getStorageStats();
      setOpfsSizeBytes(stats.totalBytes);
      setOpfsSizeStatus('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('storage.error');
      setOpfsSizeError(message);
      setOpfsSizeStatus('error');
    }
  }, [opfsSupported, t]);
  useEffect(() => {
    handleCalculateOpfsSize();
  }, []);

  const handleViewDetails = useCallback((entry: OPFSDirectoryEntry) => {
    if (entry.kind !== 'file') return;
    setModalState({ type: 'detail', file: entry });
  }, []);

  const handlePreview = useCallback((entry: OPFSDirectoryEntry) => {
    if (entry.kind !== 'file') return;
    setModalState({ type: 'preview', file: entry });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({ type: null, file: null });
  }, []);

  const handleDownload = useCallback(
    async (entry: OPFSDirectoryEntry) => {
      if (entry.kind !== 'file') return;

      try {
        const file = await OPFSManager.getFileByPath(entry.path);
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = entry.path.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        const message = err instanceof Error ? err.message : t('storage.error');
        setError(message);
      }
    },
    [t]
  );

  const handleToggleDirectory = useCallback(
    (entry: OPFSDirectoryEntry) => {
      if (entry.kind !== 'directory') {
        return;
      }

      const isExpanded = expandedPaths.has(entry.path);

      setExpandedPaths((prev) => {
        const next = new Set(prev);
        if (isExpanded) {
          next.delete(entry.path);
        } else {
          next.add(entry.path);
        }
        return next;
      });

      if (!isExpanded && !childrenMap[entry.path] && !loadingPaths[entry.path]) {
        loadDirectoryEntries(entry.path);
      }
    },
    [childrenMap, expandedPaths, loadDirectoryEntries, loadingPaths]
  );

  const retryLoad = useCallback(
    (path: string) => {
      loadDirectoryEntries(path);
    },
    [loadDirectoryEntries]
  );

  const renderActions = (entry: OPFSDirectoryEntry) => {
    if (entry.kind !== 'file') {
      return null;
    }

    return (
      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => handleViewDetails(entry)}
          className={[
            baseIconButtonClass,
            'hover:bg-blue-50 hover:text-blue-600',
            'focus-visible:outline-blue-500',
          ].join(' ')}
          aria-label={t('storage.table.actions.detail')}
        >
          <MdInfo className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => handlePreview(entry)}
          className={[
            baseIconButtonClass,
            'hover:bg-green-50 hover:text-green-600',
            'focus-visible:outline-green-500',
          ].join(' ')}
          aria-label={t('storage.table.actions.preview')}
        >
          <MdVisibility className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => handleDownload(entry)}
          className={[
            baseIconButtonClass,
            'hover:bg-indigo-50 hover:text-indigo-600',
            'focus-visible:outline-indigo-500',
          ].join(' ')}
          aria-label={t('storage.table.actions.download')}
        >
          <MdDownload className="h-5 w-5" />
        </button>
      </div>
    );
  };

  const renderEntryRow = (entry: OPFSDirectoryEntry, depth: number): React.ReactNode => {
    const isDirectory = entry.kind === 'directory';
    const isExpanded = expandedPaths.has(entry.path);
    const paddingLeft = depth * 16;
    const children = isDirectory ? childrenMap[entry.path] : undefined;
    const isPathLoading = loadingPaths[entry.path];
    const pathError = pathErrors[entry.path];

    return (
      <div key={entry.path} className="px-4 py-3">
        <div className="flex items-center gap-3" style={{ paddingLeft }}>
          {isDirectory ? (
            <button
              type="button"
              onClick={() => handleToggleDirectory(entry)}
              className={directoryToggleClass}
              aria-label={isExpanded ? t('storage.tree.collapse') : t('storage.tree.expand')}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <MdExpandMore className="h-4 w-4" />
              ) : (
                <MdChevronRight className="h-4 w-4" />
              )}
              <span className="text-sm font-medium text-gray-900">{entry.name}</span>
            </button>
          ) : (
            <span className="w-5" aria-hidden />
          )}
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div
              className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-800"
              style={{ direction: 'rtl', textAlign: 'left' }}
              title={entry.path}
            >
              {entry.path}
            </div>
            {entry.kind === 'file' ? (
              <div className="min-w-[96px] text-right text-sm font-medium text-gray-900">
                {formatFileSize(entry.size ?? 0)}
              </div>
            ) : null}
            {renderActions(entry)}
          </div>
        </div>
        {isDirectory && isExpanded ? (
          <div className="mt-2 border-l border-gray-200 pl-4">
            {isPathLoading ? (
              <p className="px-2 py-1 text-sm text-gray-500">{t('storage.tree.loadingChildren')}</p>
            ) : pathError ? (
              <div className="flex items-center gap-2 px-2 py-1 text-sm text-red-700">
                <span>{t('storage.tree.loadError')}</span>
                <button
                  type="button"
                  onClick={() => retryLoad(entry.path)}
                  className={retryButtonClass}
                >
                  {t('storage.tree.retry')}
                </button>
              </div>
            ) : (children?.length ?? 0) === 0 ? (
              <p className="px-2 py-1 text-sm text-gray-500">{t('storage.tree.emptyDirectory')}</p>
            ) : (
              children?.map((child) => renderEntryRow(child, depth + 1))
            )}
          </div>
        ) : null}
      </div>
    );
  };

  const rootLoading = Boolean(loadingPaths['']);
  const rootError = pathErrors[''];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{t('storage.title')}</h3>
        <p className="text-sm text-gray-600">{t('storage.description')}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {opfsSizeBytes !== null ? (
            <span>{t('storage.usage.opfsSize', { size: formatFileSize(opfsSizeBytes) })}</span>
          ) : null}
          {opfsSizeError ? <span className="text-red-700">{opfsSizeError}</span> : null}
          <button
            type="button"
            onClick={handleCalculateOpfsSize}
            disabled={opfsSizeStatus === 'working' || !opfsSupported}
            className={[
              'inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-700 transition-colors',
              'hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
            ].join(' ')}
          >
            {opfsSizeStatus === 'working'
              ? t('storage.usage.calculating')
              : t('storage.usage.calculate')}
          </button>
        </div>
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

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h4 className="text-base font-semibold text-gray-900">{t('storage.table.title')}</h4>
            <p className="text-sm text-gray-500">{t('storage.table.description')}</p>
          </div>
          <span className="text-xs text-gray-500">
            {rootLoading ? t('storage.tree.loadingRoot') : null}
          </span>
        </div>
        <div className="divide-y">
          {rootLoading && (
            <div className="px-4 py-3 text-sm text-gray-500">{t('storage.tree.loadingRoot')}</div>
          )}
          {rootError && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-700">
              <span>{rootError}</span>
              <button type="button" onClick={() => retryLoad('')} className={retryButtonClass}>
                {t('storage.tree.retry')}
              </button>
            </div>
          )}
          {!rootLoading && !rootError && rootEntries.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">{t('storage.table.empty')}</div>
          )}
          {!rootLoading && !rootError && rootEntries.length > 0
            ? rootEntries.map((entry) => renderEntryRow(entry, 0))
            : null}
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
            className={[
              'rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors',
              'hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60',
            ].join(' ')}
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
      <FileDetailsModal
        isOpen={modalState.type === 'detail'}
        file={modalState.file}
        onClose={handleCloseModal}
      />
      <FilePreviewModal
        isOpen={modalState.type === 'preview'}
        file={modalState.file}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default StoragePage;
