import React, { useEffect } from 'react';
import { TocItem } from '../../../types/epub';
import { Book } from 'epubjs';

/**
 * Table of Contents sidebar component
 * Provides collapsible chapter navigation
 */
interface TOCSidebarProps {
  // Current chapter being viewed
  currentChapter: string | null;

  // Callback for chapter selection
  onChapterSelect: (href: string) => void;

  // Sidebar open/close state
  isOpen: boolean;

  // Callback for sidebar toggle
  onToggle: () => void;

  // Table of contents items
  tableOfContents: TocItem[];
}

/**
 * Table of Contents sidebar component
 * Provides collapsible chapter navigation
 * @param props
 * @returns
 */
export const TOCSidebar: React.FC<TOCSidebarProps> = (props) => {
  // 1. Render TOC items recursively
  const renderTocItems = (items: TocItem[], level = 0) =>
    items.map((item) => (
      <div key={item.href} className="w-full">
        <button
          onClick={() => props.onChapterSelect(item.href)}
          className={`
            w-full text-left px-3 py-2 text-sm rounded transition-colors
            ${level > 0 ? 'ml-4' : ''}
            ${
              props.currentChapter === item.href
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
      <div
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white shadow-lg
          transform transition-transform duration-300 z-40
          ${props.isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Table of Contents</h3>
            <button
              onClick={props.onToggle}
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
          {props.tableOfContents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No table of contents available</p>
            </div>
          ) : (
            <div className="space-y-1">{renderTocItems(props.tableOfContents)}</div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {props.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={props.onToggle}
        />
      )}
    </>
  );
};
