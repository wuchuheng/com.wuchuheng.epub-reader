import React from 'react';
import { AISettingItem } from '../../../types/epub';
import { ModelSearchInput } from './ModelSearchInput';

/**
 * Props for tool form component.
 */
interface ToolFormProps {
  /** Optional existing tool data for editing. */
  tool?: Partial<AISettingItem>;
  /** Handler for tool name changes. */
  onNameChange: (name: string) => void;
  /** Handler for prompt changes. */
  onPromptChange: (prompt: string) => void;
  /** Handler for model selection changes. */
  onModelChange: (model: string) => void;
  /** Whether to show the name input field. */
  showNameField?: boolean;
  /** Default value for name field. */
  defaultName?: string;
  /** Default value for prompt field. */
  defaultPrompt?: string;
  /** Default value for model field. */
  defaultModel?: string;
  /** API endpoint for fetching models. */
  apiEndpoint?: string;
  /** API key for authentication. */
  apiKey?: string;
}

/**
 * Reusable form component for creating/editing AI tools.
 * Eliminates code duplication between existing tools and new tool creation.
 */
export const ToolForm: React.FC<ToolFormProps> = ({
  tool,
  onNameChange,
  onPromptChange,
  onModelChange,
  showNameField = false,
  defaultName = '',
  defaultPrompt = '',
  defaultModel = '',
  apiEndpoint,
  apiKey,
}) => (
  <div className="space-y-3">
    {showNameField && (
      <div>
        <label className="mb-1 block text-sm text-gray-700">Tool Name</label>
        <input
          type="text"
          value={defaultName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Simple Explanation"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>
    )}

    <div>
      <label className="mb-1 block text-sm text-gray-700">Prompt</label>
      <textarea
        value={tool?.prompt || defaultPrompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="e.g., Explain {selectedText} in simple terms"
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        rows={3}
      />
    </div>

    <div>
      <ModelSearchInput
        value={tool?.model || defaultModel}
        onChange={onModelChange}
        apiEndpoint={apiEndpoint || ''}
        apiKey={apiKey || ''}
        placeholder="Search or enter model name..."
      />
    </div>
  </div>
);
