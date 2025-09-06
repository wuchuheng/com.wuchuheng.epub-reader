import React from 'react';

/**
 * Props for iframe tool form component.
 */
interface IframeToolFormProps {
  /** Current URL value. */
  url: string;
  /** Handler for URL changes. */
  onUrlChange: (url: string) => void;
}

/**
 * Form component specific to iframe tool configuration.
 * Encapsulates all iframe-related form fields and logic.
 */
export const IframeToolForm: React.FC<IframeToolFormProps> = ({ url, onUrlChange }) => (
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
  </>
);
