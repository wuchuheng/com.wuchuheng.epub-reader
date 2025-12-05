import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCoverBase64ByPath } from '../../services/OPFSManager';

interface BookCoverProps {
  /** Path to the cover image */
  coverPath?: string;
  /** Book title for alt text and fallback */
  title: string;
  /** Callback when cover fails to load */
  onError?: () => void;
  /** Optional custom className */
  className?: string;
}

/**
 * Component for rendering book cover with loading states and error handling
 * Shows placeholder while loading or if cover fails to load
 */
export const BookCover: React.FC<BookCoverProps> = ({
  coverPath,
  title,
  onError,
  className = '',
}) => {
  const { t } = useTranslation('common');
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // 1. Input validation
    if (!coverPath) {
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // 2. Core processing - load cover image
    const loadCover = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const base64Str = await getCoverBase64ByPath(coverPath);
        if (base64Str) {
          setCoverUrl(base64Str);
        } else {
          setHasError(true);
          onError?.();
        }
      } catch (error) {
        console.error('Failed to load cover:', error);
        setHasError(true);
        onError?.();
      } finally {
        setIsLoading(false);
      }
    };

    loadCover();
  }, [coverPath, onError]);

  // 3. Output handling - render appropriate state
  if (isLoading) {
    return (
      <div className={`relative aspect-[3/4] animate-pulse bg-gray-200 ${className}`}>
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-gray-400">
            <div className="mb-2 text-4xl">📚</div>
            <div className="text-sm">{t('loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !coverUrl) {
    return (
      <div
        className={`relative aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 ${className}`}
      >
        <div className="flex h-full w-full items-center justify-center">
          <div className="p-4 text-center">
            <div className="mb-2 text-4xl">📚</div>
            <div className="truncate px-2 text-sm font-medium text-gray-600" title={title}>
              {title}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative aspect-[3/4] bg-gray-200 ${className}`}>
      <img
        src={coverUrl}
        alt={title}
        className="h-full w-full object-cover"
        onError={(e) => {
          // Fallback to placeholder if cover fails to load
          e.currentTarget.style.display = 'none';
          setHasError(true);
          onError?.();
        }}
      />
    </div>
  );
};
