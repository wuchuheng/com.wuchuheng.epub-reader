import React from 'react';

/**
 * Props for API configuration component.
 */
interface ApiConfigProps {
  /** Current API endpoint URL. */
  apiEndpoint: string;
  /** Current API key for authentication. */
  apiKey: string;
  /** Handler for API endpoint changes. */
  onApiEndpointChange: (endpoint: string) => void;
  /** Handler for API key changes. */
  onApiKeyChange: (key: string) => void;
}

/**
 * Reusable API configuration component.
 * Provides input fields for API endpoint and key with consistent styling.
 */
export const ApiConfig: React.FC<ApiConfigProps> = ({
  apiEndpoint,
  apiKey,
  onApiEndpointChange,
  onApiKeyChange,
}) => (
  <div className="space-y-6">
    <div className="mb-6">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        API Endpoint
      </label>
      <input
        type="text"
        value={apiEndpoint}
        onChange={(e) => onApiEndpointChange(e.target.value)}
        placeholder="https://api.example.com/v1"
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
      />
    </div>

    <div className="mb-6">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        API Key
      </label>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        placeholder="Your API key"
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
      />
    </div>
  </div>
);
