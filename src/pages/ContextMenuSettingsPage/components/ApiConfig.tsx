import React, { useState, useEffect, useMemo } from 'react';
import { EyeOpen, EyeClosed } from '../../../components/icons';
import { AiProviderId, AI_PROVIDER_CATALOG } from '@/config/aiProviders';
import { SearchableSelect } from '@/components/SearchableSelect';

export interface ApiStatus {
  type: 'error' | 'warning' | 'success';
  message: string;
  link?: string;
  isTesting: boolean;
}

/**
 * Props for API configuration component.
 */
interface ApiConfigProps {
  /** Current Provider ID */
  providerId?: AiProviderId;
  /** Current API endpoint URL (Base URL). */
  apiEndpoint: string;
  /** Current API key for authentication. */
  apiKey: string;
  /** Handler for Provider changes. */
  onProviderChange: (providerId: AiProviderId) => void;
  /** Handler for API endpoint changes. */
  onApiEndpointChange: (endpoint: string) => void;
  /** Handler for API key changes. */
  onApiKeyChange: (key: string) => void;
  /** Handler for API status updates */
  onStatusChange?: (status: ApiStatus | null) => void;
  /** Increment to re-run validation/tests on demand */
  testNonce?: number;
}

/**
 * Enhanced URL validation
 */
const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Simple API configuration component with clean, layered validation.
 * Shows field errors only when they occur. Status is reported to parent.
 */
export const ApiConfig: React.FC<ApiConfigProps> = ({
  providerId,
  apiEndpoint,
  apiKey,
  onProviderChange,
  onApiEndpointChange,
  onApiKeyChange,
  onStatusChange,
  testNonce = 0,
}) => {
  // Field error states (only show errors)
  const [endpointError, setEndpointError] = useState<string>('');
  const [keyError, setKeyError] = useState<string>('');

  // Password visibility state
  const [showApiKey, setShowApiKey] = useState(false);

  const selectedProvider = useMemo(
    () => AI_PROVIDER_CATALOG.find((p) => p.id === providerId),
    [providerId]
  );

  const isCustomProvider = providerId === 'custom';

  // Prepare options for SearchableSelect
  const providerOptions = useMemo(
    () =>
      AI_PROVIDER_CATALOG.map((p) => ({
        value: p.id,
        label: p.name,
        note: p.baseUrl,
      })),
    []
  );

  // Validate fields and show errors conditionally
  useEffect(() => {
    // Show endpoint error if:
    // 1. Field has content but is invalid URL
    // 2. Other field has content but this one is empty (user is filling form)
    const hasInvalidUrl = apiEndpoint.length > 0 && !isValidUrl(apiEndpoint);
    const shouldShowBecauseOtherFieldFilled = apiKey.length > 0 && apiEndpoint.length === 0;

    if (hasInvalidUrl) {
      setEndpointError('Please enter a valid URL');
    } else if (shouldShowBecauseOtherFieldFilled) {
      setEndpointError('Base URL is required');
    } else {
      setEndpointError('');
    }
  }, [apiEndpoint, apiKey]);

  useEffect(() => {
    // Show key error only if:
    // 1. Other field has content but this one is empty
    // 2. Don't show if URL is invalid (prioritize URL error first)
    const shouldShowKeyError =
      apiKey.length === 0 && apiEndpoint.length > 0 && isValidUrl(apiEndpoint);

    if (shouldShowKeyError) {
      setKeyError('API key is required');
    } else {
      setKeyError('');
    }
  }, [apiKey, apiEndpoint]);

  // Test API connection when both fields are filled and valid
  useEffect(() => {
    const testApiConnection = async () => {
      if (apiEndpoint && apiKey && isValidUrl(apiEndpoint)) {
        onStatusChange?.({ type: 'success', message: 'Testing API connection...', isTesting: true });
        try {
          const response = await fetch(`${apiEndpoint}/models`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            const modelCount = data.data && Array.isArray(data.data) ? data.data.length : 0;
            onStatusChange?.({
              type: 'success',
              message:
                modelCount > 0
                  ? `API connected successfully (${modelCount} models available)`
                  : 'API connected successfully',
              isTesting: false,
            });
          } else {
            onStatusChange?.({
              type: 'error',
              message: `API connection failed: ${response.status} ${response.statusText}`,
              link: selectedProvider?.docsUrl,
              isTesting: false,
            });
          }
        } catch (error) {
          onStatusChange?.({
            type: 'error',
            message: `Network error: ${error instanceof Error ? error.message : 'Connection failed'}`,
            link: selectedProvider?.docsUrl,
            isTesting: false,
          });
        }
      } else {
        // Set summary status based on form state
        if (!apiEndpoint && !apiKey) {
          onStatusChange?.({
            type: 'warning',
            message: 'Please configure provider, Base URL and API key',
            isTesting: false,
          });
        } else if (!apiEndpoint) {
          onStatusChange?.({
            type: 'warning',
            message: 'Please enter Base URL',
            isTesting: false,
          });
        } else if (!apiKey) {
          onStatusChange?.({
            type: 'warning',
            message: 'Please enter API key',
            isTesting: false,
          });
        } else if (!isValidUrl(apiEndpoint)) {
          onStatusChange?.({
            type: 'error',
            message: 'Please fix Base URL format',
            isTesting: false,
          });
        } else {
          onStatusChange?.(null);
        }
      }
    };

    // Debounce the API test
    const timeoutId = setTimeout(testApiConnection, 1000);
    return () => clearTimeout(timeoutId);
  }, [apiEndpoint, apiKey, selectedProvider, onStatusChange, testNonce]);

  return (
    <div className="space-y-4">
      {/* Provider Selector */}
      <div>
        <SearchableSelect
          label="API Provider"
          value={providerId || ''}
          onChange={(val) => onProviderChange(val as AiProviderId)}
          options={providerOptions}
          placeholder="Select an AI provider..."
          className="w-full"
          isFilterable={false}
        />
        {selectedProvider && (
          <div className="mt-2 text-xs text-gray-600">
            <div className="font-medium text-gray-700">
              {selectedProvider.baseUrl ? `Base URL: ${selectedProvider.baseUrl}` : 'Custom OpenAI-compatible service'}
            </div>
            {selectedProvider.docsUrl && (
              <a
                href={selectedProvider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View provider docs
              </a>
            )}
          </div>
        )}
      </div>

      {/* API Endpoint Field - Only shown for Custom provider */}
      {isCustomProvider && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Base URL</label>
          <input
            type="text"
            value={apiEndpoint}
            onChange={(e) => onApiEndpointChange(e.target.value)}
            placeholder="https://api.example.com/v1"
            className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
              endpointError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
          {endpointError && <div className="mt-1 text-sm text-red-600">{endpointError}</div>}
        </div>
      )}

      {/* API Key Field */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">API Key</label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Your API key"
            className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
              keyError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showApiKey ? <EyeClosed /> : <EyeOpen />}
          </button>
        </div>
        {keyError && <div className="mt-1 text-sm text-red-600">{keyError}</div>}
      </div>
    </div>
  );
};
