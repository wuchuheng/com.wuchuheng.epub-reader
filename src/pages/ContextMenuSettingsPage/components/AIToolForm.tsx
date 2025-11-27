import React from 'react';
import { SelectionSituation } from '../../../types/epub';

/**
 * Props for AI tool form component.
 */
interface AIToolFormProps {
  /** Current prompt value. */
  prompt: string;
  /** Whether reasoning is enabled. */
  reasoningEnabled: boolean;
  /** Current default behavior. */
  defaultFor?: SelectionSituation;
  /** Handler for prompt changes. */
  onPromptChange: (prompt: string) => void;
  /** Handler for reasoning toggle. */
  onReasoningToggle: (enabled: boolean) => void;
  /** Handler for default behavior changes. */
  onDefaultForChange: (situation: SelectionSituation | undefined) => void;
}

/**
 * Form component specific to AI tool configuration.
 * Encapsulates all AI-related form fields and logic.
 */
export const AIToolForm: React.FC<AIToolFormProps> = ({
  prompt,
  reasoningEnabled,
  defaultFor,
  onPromptChange,
  onReasoningToggle,
  onDefaultForChange,
}) => (
  <div className="space-y-4">
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">Prompt</label>
      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Use {{words}} for selected text and {{context}} for nearby content. e.g. Summarize {{words}} in 2 sentences."
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        rows={3}
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

    {/* Default Behavior Setting */}
    <div className="pt-2 border-t border-gray-100">
      <label className="mb-2 block text-sm font-medium text-gray-700">Default Tool Behavior</label>
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
        <div className="flex items-center">
          <input
            type="radio"
            id="defaultNone"
            name="defaultFor"
            checked={defaultFor === undefined}
            onChange={() => onDefaultForChange(undefined)}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="defaultNone" className="ml-2 block text-sm text-gray-700">
            None
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="radio"
            id="defaultWord"
            name="defaultFor"
            checked={defaultFor === 'word'}
            onChange={() => onDefaultForChange('word')}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="defaultWord" className="ml-2 block text-sm text-gray-700">
            Default for Single Word
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="radio"
            id="defaultSentence"
            name="defaultFor"
            checked={defaultFor === 'sentence'}
            onChange={() => onDefaultForChange('sentence')}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="defaultSentence" className="ml-2 block text-sm text-gray-700">
            Default for Multi-Word
          </label>
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        If selected, this tool will automatically open when you select text matching the condition.
      </p>
    </div>
  </div>
);
