import React from 'react';

/**
 * Props for iframe tool form component.
 */
interface IframeToolFormProps {
  /** Current URL value. */
  url: string;
  /** Whether single-word selections are supported. */
  supportsSingleWord: boolean;
  /** Whether multi-word selections are supported. */
  supportsMultiWord: boolean;
  /** Whether support controls are disabled. */
  supportsDisabled: boolean;
  /** Handler for URL changes. */
  onUrlChange: (url: string) => void;
  /** Handler for support toggles. */
  onSupportChange: (target: 'single' | 'multi', enabled: boolean) => void;
}

/**
 * Form component specific to iframe tool configuration.
 * Encapsulates all iframe-related form fields and logic.
 */
export const IframeToolForm: React.FC<IframeToolFormProps> = ({
  url,
  supportsSingleWord,
  supportsMultiWord,
  supportsDisabled,
  onUrlChange,
  onSupportChange,
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

    {/* Selection support */}
    <div className="mt-4 border-t border-gray-100 pt-2">
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
  </>
);
