import React from 'react';
import { AISettingItem } from '../../../types/epub';

/**
 * Props for tool list component.
 */
interface ToolListProps {
  /** Array of AI tools to display. */
  tools: AISettingItem[];
  /** Handler for updating a tool at specific index. */
  onToolUpdate: (index: number, updatedTool: Partial<AISettingItem>) => void;
  /** Handler for removing a tool at specific index. */
  onToolRemove: (index: number) => void;
}

/**
 * Reusable component for displaying and managing a list of AI tools.
 * Handles tool editing and removal functionality with empty state handling.
 */
export const ToolList: React.FC<ToolListProps> = ({
  tools,
  onToolUpdate,
  onToolRemove,
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
            </div>
            <button
              onClick={() => onToolRemove(index)}
              className="text-red-500 transition-colors hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-gray-700">
                Prompt
              </label>
              <textarea
                value={tool.prompt}
                onChange={(e) => onToolUpdate(index, { prompt: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-700">
                Model
              </label>
              <select
                value={tool.model}
                onChange={(e) => onToolUpdate(index, { model: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
