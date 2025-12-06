import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/Modal';
import { OPFSDirectoryEntry, getFileByPath } from '../../../services/OPFSManager';
import { formatFileSize } from '../../../utils/epubValidation';

type FileDetailsModalProps = {
  isOpen: boolean;
  file: OPFSDirectoryEntry | null;
  onClose: () => void;
};

type FileMetadata = {
  type: string;
  lastModified?: number;
};

const getFileExtension = (path: string): string =>
  path.split('.').pop()?.toLowerCase() ?? '';

const useFileMetadata = (
  file: OPFSDirectoryEntry | null,
  isOpen: boolean,
  fallbackError: string
) => {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !file || file.kind !== 'file') {
      setMetadata(null);
      setIsLoading(false);
      setError(null);
      return undefined;
    }

    let isCancelled = false;

    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedFile = await getFileByPath(file.path);
        if (isCancelled) return;
        setMetadata({ type: fetchedFile.type, lastModified: fetchedFile.lastModified });
      } catch (err) {
        if (isCancelled) return;
        const message = err instanceof Error ? err.message : fallbackError;
        setError(message);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchMetadata();

    return () => {
      isCancelled = true;
    };
  }, [file, fallbackError, isOpen]);

  return { metadata, isLoading, error };
};

export const FileDetailsModal: React.FC<FileDetailsModalProps> = ({ isOpen, file, onClose }) => {
  const { t } = useTranslation('settings');
  const { metadata, isLoading, error } = useFileMetadata(file, isOpen, t('storage.error'));

  if (!isOpen || !file) {
    return null;
  }

  if (file.kind !== 'file') {
    return null;
  }

  const extension = getFileExtension(file.path);
  const lastModifiedText = metadata?.lastModified
    ? new Date(metadata.lastModified).toLocaleString()
    : t('storage.modals.detail.notAvailable');
  const typeText = metadata?.type || t('storage.modals.detail.notAvailable');

  return (
    <Modal
      isOpen={isOpen}
      title={t('storage.modals.detail.title')}
      onClose={onClose}
      closeLabel={t('storage.modals.detail.close')}
    >
      <div className="space-y-3 text-sm text-gray-800">
        {isLoading ? (
          <p className="text-gray-500">{t('storage.table.loadingLabel')}</p>
        ) : null}
        {error ? <p className="text-red-600">{error}</p> : null}
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('storage.modals.detail.path')}</dt>
            <dd className="mt-1 break-all text-sm text-gray-900">{file.path}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('storage.modals.detail.size')}</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatFileSize(file.size ?? 0)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('storage.modals.detail.type')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{typeText || '--'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              {t('storage.modals.detail.extension')}
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{extension ? `.${extension}` : '--'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              {t('storage.modals.detail.lastModified')}
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{lastModifiedText}</dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
};
