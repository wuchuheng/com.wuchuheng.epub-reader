import React from 'react';
import { TocItem } from '../../../types/epub';

/**
 * Table of Contents sidebar component
 * Provides collapsible chapter navigation
 */
interface TOCSidebarProps {
  tableOfContents: TocItem[];
  currentChapter: string | null;
  onChapterSelect: (href: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const TOCSidebar: React.FC<TOCSidebarProps> = ({
  tableOfContents,
  currentChapter,
  onChapterSelect,
  isOpen,
  onToggle,
}) => {
  // 1. Render TOC items recursively
  const renderTocItems = (items: TocItem[], level = 0) =>
    items.map((item) => (
      <div key={item.href} className="w-full">
        <button
          onClick={() => onChapterSelect(item.href)}
          className={`
            w-full text-left px-3 py-2 text-sm rounded transition-colors
            ${level > 0 ? 'ml-4' : ''}
            ${
              currentChapter === item.href
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }
          `}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {item.label}
        </button>
        {item.subitems && item.subitems.length > 0 && (
          <div className="ml-2">{renderTocItems(item.subitems, level + 1)}</div>
        )}
      </div>
    ));

  // 2. Main sidebar content
  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={`
          fixed top-4 left-4 z-50 p-2 bg-white rounded shadow-lg
          transition-transform duration-300
          ${isOpen ? 'translate-x-64' : 'translate-x-0'}
        `}
        aria-label="Toggle table of contents"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white shadow-lg
          transform transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Table of Contents</h3>
            <button
              onClick={onToggle}
              className="p-1 text-gray-500 hover:text-gray-700"
              aria-label="Close table of contents"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-4">
          {tableOfContents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No table of contents available</p>
            </div>
          ) : (
            <div className="space-y-1">{renderTocItems(tableOfContents)}</div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={onToggle} />
      )}
    </>
  );
};
