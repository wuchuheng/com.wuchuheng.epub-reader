import React from 'react';

/**
 * Main EPUB reader view component
 * Handles the actual EPUB rendering and display
 */
interface ReaderViewProps {
  error: string | null;
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * @param props
 * @returns
 */
export const ReaderView: React.FC<ReaderViewProps> = (props) => {
  // 1. Use the epub reader hook

  // 3. Error state
  if (props.error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Book</h3>
          <p className="text-gray-600 mb-4">{props.error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 4. Main reader view
  return (
    <div className="flex-1 relative bg-white">
      {/* EPUB.js will render into this container */}
      <div ref={props.containerRef} className="w-full h-full" />

      {/* Reader overlay for interactions */}
      <div className="absolute inset-0 pointer-events-none">
        {/* This space can be used for overlays, selection menus, etc. */}
      </div>
    </div>
  );
};
