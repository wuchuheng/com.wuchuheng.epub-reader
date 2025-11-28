import React from 'react';
import { SelectionSituation } from '../../../types/epub';

/**
 * Props for iframe tool form component.
 */
interface IframeToolFormProps {
  /** Current URL value. */
  url: string;
  /** Current default behavior. */
  defaultFor?: SelectionSituation;
  /** Whether default selection controls are disabled. */
  defaultsDisabled: boolean;
  /** Handler for URL changes. */
  onUrlChange: (url: string) => void;
  /** Handler for default behavior changes. */
  onDefaultForChange: (situation: SelectionSituation | undefined) => void;
}

/**
 * Form component specific to iframe tool configuration.
 * Encapsulates all iframe-related form fields and logic.
 */
export const IframeToolForm: React.FC<IframeToolFormProps> = ({
  url,
  defaultFor,
  defaultsDisabled,
  onUrlChange,
  onDefaultForChange,
}) => (
  <>
    {/* URL */}
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">URL</label>
      <input
        type="url"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://example.com?words={{words}}&context={{context}}"
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
      />
      <div className="mt-2 text-sm">
        <div className="mb-1 font-medium text-gray-700">Tips</div>
        <ul className="list-inside list-disc space-y-1 text-xs text-gray-500">
          <li>
            <span className="font-medium">{'{{words}}'}</span>: Inserts the text the user selected.
            Example: <code className="font-mono">https://example.com?q={'{{words}}'}</code>
          </li>
          <li>
            <span className="font-medium">{'{{context}}'}</span>: Adds nearby text or metadata to
            give more context. Example:
            <code className="font-mono">https://example.com?ctx={'{{context}}'}</code>
          </li>
        </ul>
      </div>
    </div>

    {/* Default Behavior Setting */}
    <div className="pt-2 border-t border-gray-100 mt-4">
      <label className="mb-2 block text-sm font-medium text-gray-700">Default Tool Behavior</label>
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
        <div className="flex items-center">
          <input
            type="radio"
            id="defaultNone"
            name="defaultFor"
            checked={defaultFor === undefined}
            disabled={defaultsDisabled}
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
            disabled={defaultsDisabled}
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
            disabled={defaultsDisabled}
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
  </>
);
