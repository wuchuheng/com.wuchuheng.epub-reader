import React from 'react';
import { ModelSearchInput } from './ModelSearchInput';

/**
 * Props for AI tool form component.
 */
interface AIToolFormProps {
  /** Current prompt value. */
  prompt: string;
  /** Current model value. */
  model: string;
  /** Whether reasoning is enabled. */
  reasoningEnabled: boolean;
  /** API endpoint for fetching models. */
  apiEndpoint?: string;
  /** API key for authentication. */
  apiKey?: string;
  /** Handler for prompt changes. */
  onPromptChange: (prompt: string) => void;
  /** Handler for model changes. */
  onModelChange: (model: string) => void;
  /** Handler for reasoning toggle. */
  onReasoningToggle: (enabled: boolean) => void;
}

/**
 * Form component specific to AI tool configuration.
 * Encapsulates all AI-related form fields and logic.
 */
export const AIToolForm: React.FC<AIToolFormProps> = ({
  prompt,
  model,
  reasoningEnabled,
  apiEndpoint,
  apiKey,
  onPromptChange,
  onModelChange,
  onReasoningToggle,
}) => (
  <>
    {/* Prompt */}
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Prompt
      </label>
      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="e.g., Explain {selectedText} in simple terms"
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        rows={3}
      />
    </div>

    {/* Model Selection */}
    <div>
      <ModelSearchInput
        value={model}
        onChange={onModelChange}
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
        checked={reasoningEnabled}
        onChange={(e) => onReasoningToggle(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <label htmlFor="reasoningEnabled" className="ml-2 block text-sm text-gray-700">
        Enable reasoning (for supported models)
      </label>
    </div>
  </>
);