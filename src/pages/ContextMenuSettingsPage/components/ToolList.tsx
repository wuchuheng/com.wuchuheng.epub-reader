import React from 'react';
import { AISettingItem, ContextMenuItem, IframeSettingItem } from '../../../types/epub';
import { ToolForm } from './ToolForm';

/**
 * Props for tool list component.
 */
interface ToolListProps {
  /** Array of tools to display. */
  tools: ContextMenuItem[];
  /** Handler for updating a tool at specific index. */
  onToolUpdate: (index: number, updatedTool: AISettingItem | IframeSettingItem) => void;
  /** Handler for removing a tool at specific index. */
  onToolRemove: (index: number) => void;
  /** API endpoint for fetching models. */
  apiEndpoint?: string;
  /** API key for authentication. */
  apiKey?: string;
}

/**
 * Reusable component for displaying and managing a list of tools.
 * Handles both AI and iframe tools with editing and removal functionality.
 */
export const ToolList: React.FC<ToolListProps> = ({
  tools,
  onToolUpdate,
  onToolRemove,
  apiEndpoint,
  apiKey,
}) => {
  // 1. Input handling
  if (tools.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No custom tools configured yet. Add your first tool below!
      </div>
    );
  }

  // 2. Core processing
  // 2.1 Render list of tools with edit/remove functionality
  // 3. Output handling
  return (
    <div className="space-y-3">
      {tools.map((tool, index) => (
        <div key={index} className="rounded-md border border-gray-200 p-4">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{tool.name}</h4>
              <p className="text-sm text-gray-500">{tool.shortName}</p>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                {tool.type === 'AI' ? 'AI Tool' : 'Iframe Tool'}
              </span>
            </div>
            <button
              onClick={() => onToolRemove(index)}
              className="text-red-500 transition-colors hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <div className="space-y-3">
            {tool.type === 'AI' ? (
              <ToolForm
                tool={tool as AISettingItem}
                onChange={(updatedTool) => onToolUpdate(index, updatedTool)}
                apiEndpoint={apiEndpoint}
                apiKey={apiKey}
              />
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-700">URL</label>
                  <input
                    type="url"
                    value={(tool as IframeSettingItem).url}
                    onChange={(e) => onToolUpdate(index, { ...tool, url: e.target.value })}
                    placeholder="https://example.com?words={words}&context={context}"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use {'{words}'} and {'{context}'} as placeholders for selected text
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
