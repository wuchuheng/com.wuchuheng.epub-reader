import React from 'react';

/**
 * Props for AI tool form component.
 */
interface AIToolFormProps {
  /** Current prompt value. */
  prompt: string;
  /** Whether reasoning is enabled. */
  reasoningEnabled: boolean;
  /** Whether single-word selections are supported. */
  supportsSingleWord: boolean;
  /** Whether multi-word selections are supported. */
  supportsMultiWord: boolean;
  /** Whether support controls are disabled. */
  supportsDisabled: boolean;
  /** Handler for prompt changes. */
  onPromptChange: (prompt: string) => void;
  /** Handler for reasoning toggle. */
  onReasoningToggle: (enabled: boolean) => void;
  /** Handler for support toggles. */
  onSupportChange: (target: 'single' | 'multi', enabled: boolean) => void;
}

/**
 * Form component specific to AI tool configuration.
 * Encapsulates all AI-related form fields and logic.
 */
export const AIToolForm: React.FC<AIToolFormProps> = ({
  prompt,
  reasoningEnabled,
  supportsSingleWord,
  supportsMultiWord,
  supportsDisabled,
  onPromptChange,
  onReasoningToggle,
  onSupportChange,
}) => {
  const macRows = 50;
  const currentRows = prompt.split('\n').length;
  const allowRows = Math.min(macRows, Math.max(5, currentRows));

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Use {{words}} for selected text and {{context}} for nearby content. e.g. Summarize {{words}} in 2 sentences."
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          rows={allowRows}
        />

        <div className="mt-2 text-sm text-gray-500">
          <div className="mb-1 font-medium text-gray-700">Prompt tips</div>

          <ul className="list-inside list-disc space-y-1">
            <li>
              <span className="font-medium">{'{{words}}'}</span>: the selected text.
            </li>

            <li>
              <span className="font-medium">{'{{context}}'}</span>: nearby content for background.
            </li>
          </ul>
        </div>
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

      {/* Selection support */}
      <div className="border-t border-gray-100 pt-2">
        <label className="mb-2 block text-sm font-medium text-gray-700">Selection support</label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={supportsSingleWord}
              disabled={supportsDisabled}
              onChange={(e) => onSupportChange('single', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Single-word queries</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={supportsMultiWord}
              disabled={supportsDisabled}
              onChange={(e) => onSupportChange('multi', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Multi-word queries</span>
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Pick at least one option so this tool appears for single or multi-word selections.
        </p>
      </div>
    </div>
  );
};
