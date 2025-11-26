import React from 'react';

interface DragOverlayProps {
  /** Whether the overlay is visible */
  isVisible: boolean;
}

/**
 * Visual overlay component displayed when dragging a file over the home page.
 */
export const DragOverlay: React.FC<DragOverlayProps> = ({ isVisible }) => {
  // 3. Output handling
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-200">
      <div className="rounded-xl border-4 border-dashed border-blue-500 p-12 text-center">
        <div className="mb-4 text-6xl">📂</div>
        <h2 className="text-2xl font-bold text-blue-600">Drop EPUB file here</h2>
        <p className="mt-2 text-gray-600">Release to upload your book</p>
      </div>
    </div>
  );
};
