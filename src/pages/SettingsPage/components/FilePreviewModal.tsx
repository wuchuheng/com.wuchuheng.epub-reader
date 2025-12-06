import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { OPFSDirectoryEntry, getFileByPath } from '../../../services/OPFSManager';

type FilePreviewModalProps = {
  isOpen: boolean;
  file: OPFSDirectoryEntry | null;
  onClose: () => void;
};

type PreviewState =
  | { type: 'text'; content: string }
  | { type: 'image'; content: string }
  | { type: 'unsupported'; content: string };

const getFileExtension = (path: string): string => path.split('.').pop()?.toLowerCase() ?? '';

const isTextFile = (ext: string): boolean =>
  ['json', 'txt', 'md', 'csv', 'xml', 'html', 'css', 'js', 'ts', 'tsx'].includes(ext);

const isImageFile = (ext: string): boolean =>
  ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);

const MAX_PREVIEW_SIZE_MB = 5;
const MAX_PREVIEW_BYTES = MAX_PREVIEW_SIZE_MB * 1024 * 1024;

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, file, onClose }) => {
  const { t } = useTranslation('settings');
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const extension = useMemo(() => (file ? getFileExtension(file.path) : ''), [file]);
  const fileName = useMemo(() => file?.path.split('/').pop() ?? '', [file]);
  const primaryButtonClass = [
    'rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors',
    'hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-blue-500',
  ].join(' ');
  const secondaryButtonClass = [
    'rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors',
    'hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    'focus-visible:outline-blue-500',
  ].join(' ');
  const closeButtonClass = [
    'rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1',
    'focus-visible:outline-blue-500',
  ].join(' ');
  const textPreviewClass = [
    'max-h-96 w-full resize-none rounded-md border border-gray-300 bg-gray-50 p-4',
    'font-mono text-sm text-gray-900',
  ].join(' ');

  useEffect(() => {
    if (!isOpen || !file || file.kind !== 'file') {
      setPreview(null);
      setError(null);
      setIsLoading(false);
      setCopied(false);
      return undefined;
    }

    if (!isTextFile(extension) && !isImageFile(extension)) {
      setPreview({ type: 'unsupported', content: '' });
      setIsLoading(false);
      setError(null);
      setCopied(false);
      return undefined;
    }

    let isCancelled = false;
    let objectUrl: string | null = null;

    const loadPreview = async () => {
      setIsLoading(true);
      setError(null);
      setCopied(false);

      try {
        const fetchedFile = await getFileByPath(file.path);

        if (fetchedFile.size > MAX_PREVIEW_BYTES) {
          if (!isCancelled) {
            setError(t('storage.modals.preview.tooLarge', { size: MAX_PREVIEW_SIZE_MB }));
            setPreview(null);
            setIsLoading(false);
          }
          return;
        }

        if (isTextFile(extension)) {
          const text = await fetchedFile.text();
          if (!isCancelled) {
            setPreview({ type: 'text', content: text });
          }
        } else if (isImageFile(extension)) {
          objectUrl = URL.createObjectURL(fetchedFile);
          if (!isCancelled) {
            setPreview({ type: 'image', content: objectUrl });
          }
        }
      } catch (err) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : t('storage.error');
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      isCancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [extension, file, isOpen, t]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  if (!isOpen || !file) {
    return null;
  }

  if (file.kind !== 'file') {
    return null;
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleCopy = async () => {
    if (preview?.type !== 'text') {
      return;
    }

    try {
      await navigator.clipboard.writeText(preview.content);
      setCopied(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('storage.error');
      setError(message);
    }
  };

  const renderPreviewContent = () => {
    if (isLoading) {
      return <p className="text-gray-500">{t('storage.modals.preview.loading')}</p>;
    }

    if (error) {
      return (
        <p className="text-red-600">{t('storage.modals.preview.error', { message: error })}</p>
      );
    }

    if (!preview) {
      return null;
    }

    if (preview.type === 'text') {
      return <textarea readOnly value={preview.content} className={textPreviewClass} rows={50} />;
    }

    if (preview.type === 'image') {
      return (
        <img
          src={preview.content}
          alt={fileName || file.path}
          className="max-h-[70vh] max-w-full rounded object-contain"
        />
      );
    }

    return (
      <p className="text-gray-700">
        {t('storage.modals.preview.unsupported', { ext: extension || 'file' })}
      </p>
    );
  };

  const renderFooter = () => {
    if (preview?.type === 'text') {
      return (
        <>
          <button type="button" onClick={handleCopy} className={primaryButtonClass}>
            {copied ? t('storage.modals.preview.copied') : t('storage.modals.preview.copy')}
          </button>
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            {t('storage.modals.preview.close')}
          </button>
        </>
      );
    }

    return (
      <button type="button" onClick={onClose} className={secondaryButtonClass}>
        {t('storage.modals.preview.close')}
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('storage.modals.preview.title', { filename: fileName })}
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('storage.modals.preview.title', { filename: fileName || file.path })}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={closeButtonClass}
            aria-label={t('storage.modals.preview.close')}
          >
            <MdClose className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-3 text-gray-800">{renderPreviewContent()}</div>
        <div className="flex flex-wrap justify-end gap-2 border-t px-4 py-3">{renderFooter()}</div>
      </div>
    </div>
  );
};
