import React, { useCallback, useState } from 'react';
import { useAppDispatch } from '../../store';
import { uploadBook } from '../../store/slices/bookshelfSlice';

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
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Input handling - validate file type
  const validateFile = (file: File): boolean => {
    // More permissive validation - check file extension and basic file properties
    const isEpub = file.name.toLowerCase().endsWith('.epub');
    const hasContent = file.size > 0;
    const maxSize = 100 * 1024 * 1024; // 100MB

    return isEpub && hasContent && file.size <= maxSize;
  };

  // 2. Core processing - handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!validateFile(file)) {
        alert('Please select a valid EPUB file');
        return;
      }

      setIsUploading(true);
      try {
        await dispatch(uploadBook(file)).unwrap();
        onUploadComplete?.();
      } catch (error) {
        alert(`Upload failed: ${error}`);
      } finally {
        setIsUploading(false);
      }
    },
    [dispatch, onUploadComplete]
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
        alert('Please drop a valid EPUB file');
      }
    },
    [handleFileUpload]
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
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Uploading book...</p>
        </div>
      ) : (
        <>
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload EPUB Book</h3>
          <p className="text-gray-600 mb-4">
            Drag and drop your EPUB file here, or click to browse
          </p>
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
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
          >
            Choose File
          </label>
          <p className="text-xs text-gray-500 mt-2">Maximum file size: 100MB</p>
        </>
      )}
    </div>
  );
};
