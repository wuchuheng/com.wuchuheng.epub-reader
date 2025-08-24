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
export const IframeToolForm: React.FC<IframeToolFormProps> = ({
  url,
  onUrlChange,
}) => (
  <>
    {/* URL */}
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        URL
      </label>
      <input
        type="url"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://example.com?words={words}&context={context}"
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
      />
      <p className="mt-1 text-xs text-gray-500">
        Use {"{words}"} and {"{context}"} as placeholders for selected text
      </p>
    </div>
  </>
);