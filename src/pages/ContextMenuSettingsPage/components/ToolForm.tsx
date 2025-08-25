import React from 'react';
import { AISettingItem } from '../../../types/epub';
import { ModelSearchInput } from './ModelSearchInput';

/**
 * Props for tool form component.
 */
interface ToolFormProps {
  /** Optional existing tool data for editing. */
  tool: AISettingItem;
  /** Handler for reasoning toggle changes. */
  onChange: (value: AISettingItem) => void;
  /** Default value for name field. */

  /** API key for authentication. */
  apiKey?: string;

  apiEndpoint?: string;
}

/**
 * Reusable form component for creating/editing AI tools.
 * Eliminates code duplication between existing tools and new tool creation.
 */
export const ToolForm: React.FC<ToolFormProps> = ({ tool, onChange, apiEndpoint, apiKey }) => (
  <div className="space-y-3">
    <div>
      <label className="mb-1 block text-sm text-gray-700">Prompt</label>
      <textarea
        value={tool?.prompt || ''}
        onChange={(e) => onChange({ ...tool, prompt: e.target.value })}
        placeholder="e.g., Explain {selectedText} in simple terms"
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        rows={3}
      />
    </div>

    <div>
      <ModelSearchInput
        value={tool?.model || ''}
        onChange={(model) => onChange({ ...tool, model })}
        apiEndpoint={apiEndpoint || ''}
        apiKey={apiKey || ''}
        placeholder="Search or enter model name..."
      />
    </div>

    {/* Reasoning Toggle */}
    <div className="flex items-center">
      <input
        type="checkbox"
        id="reasoningEnabled"
        checked={tool.reasoningEnabled}
        onChange={() => onChange({ ...tool, reasoningEnabled: !tool.reasoningEnabled })}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <label htmlFor="reasoningEnabled" className="ml-2 block text-sm text-gray-700">
        Enable reasoning (for supported models)
      </label>
    </div>
  </div>
);
