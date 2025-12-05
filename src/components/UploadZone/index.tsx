import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../store';
import { uploadBook } from '../../store/slices/bookshelfSlice';
import {
  isValidEpubFile,
  getEpubValidationError,
  MAX_EPUB_SIZE,
  formatFileSize,
} from '../../utils/epubValidation';

interface UploadZoneProps {
  /** Callback when upload is complete */
  onUploadComplete?: () => void;
}

/**
 * Component for handling EPUB file uploads via drag-and-drop or file picker
 * Provides visual feedback during upload process
 */
export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadComplete }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('homepage');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Input handling - validate file type using centralized validation
  const validateFile = (file: File): boolean => isValidEpubFile(file);

  // 2. Core processing - handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      const validationError = getEpubValidationError(file);
      if (validationError) {
        alert(validationError);
        return;
      }

      setIsUploading(true);
      try {
        await dispatch(uploadBook(file)).unwrap();
        onUploadComplete?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        alert(t('alerts.uploadFailed', { error: message }));
      } finally {
        setIsUploading(false);
      }
    },
    [dispatch, onUploadComplete, t]
  );

  // 3. Output handling - drag and drop events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const epubFile = files.find((file) => validateFile(file));

      if (epubFile) {
        handleFileUpload(epubFile);
      } else {
        alert(t('alerts.invalidFile'));
      }
    },
    [handleFileUpload, t]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  return (
    <div
      className={`rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'} ${isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <div className="flex flex-col items-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">{t('uploadZone.uploading')}</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-6xl">📚</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">{t('uploadZone.title')}</h3>
          <p className="mb-4 text-gray-600">{t('uploadZone.description')}</p>
          <input
            type="file"
            accept=".epub,application/epub+zip"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className="inline-block cursor-pointer rounded-md bg-blue-600 px-6 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
          >
            {t('uploadZone.chooseFile')}
          </label>
          <p className="mt-2 text-xs text-gray-500">
            {t('uploadZone.maxSize', { size: formatFileSize(MAX_EPUB_SIZE) })}
          </p>
        </>
      )}
    </div>
  );
};
