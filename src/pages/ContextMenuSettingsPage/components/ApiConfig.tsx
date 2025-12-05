import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('settings');
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
      setEndpointError(t('contextMenu.api.errors.validUrl'));
    } else if (shouldShowBecauseOtherFieldFilled) {
      setEndpointError(t('contextMenu.api.errors.baseUrlRequired'));
    } else {
      setEndpointError('');
    }
  }, [apiEndpoint, apiKey, t]);

  useEffect(() => {
    // Show key error only if:
    // 1. Other field has content but this one is empty
    // 2. Don't show if URL is invalid (prioritize URL error first)
    const shouldShowKeyError =
      apiKey.length === 0 && apiEndpoint.length > 0 && isValidUrl(apiEndpoint);

    if (shouldShowKeyError) {
      setKeyError(t('contextMenu.api.errors.apiKeyRequired'));
    } else {
      setKeyError('');
    }
  }, [apiKey, apiEndpoint, t]);

  // Test API connection when both fields are filled and valid
  useEffect(() => {
    const testApiConnection = async () => {
      if (apiEndpoint && apiKey && isValidUrl(apiEndpoint)) {
        onStatusChange?.({
          type: 'success',
          message: t('contextMenu.api.status.testing'),
          isTesting: true,
        });
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
                  ? t('contextMenu.api.status.connectedWithCount', { count: modelCount })
                  : t('contextMenu.api.status.connected'),
              isTesting: false,
            });
          } else {
            onStatusChange?.({
              type: 'error',
              message: t('contextMenu.api.status.failed', {
                status: `${response.status} ${response.statusText}`,
              }),
              link: selectedProvider?.docsUrl,
              isTesting: false,
            });
          }
        } catch (error) {
          onStatusChange?.({
            type: 'error',
            message: t('contextMenu.api.status.networkError', {
              message: error instanceof Error ? error.message : t('errors:unknown'),
            }),
            link: selectedProvider?.docsUrl,
            isTesting: false,
          });
        }
      } else {
        // Set summary status based on form state
        if (!apiEndpoint && !apiKey) {
          onStatusChange?.({
            type: 'warning',
            message: t('contextMenu.api.status.needConfig'),
            isTesting: false,
          });
        } else if (!apiEndpoint) {
          onStatusChange?.({
            type: 'warning',
            message: t('contextMenu.api.status.missingBaseUrl'),
            isTesting: false,
          });
        } else if (!apiKey) {
          onStatusChange?.({
            type: 'warning',
            message: t('contextMenu.api.status.missingApiKey'),
            isTesting: false,
          });
        } else if (!isValidUrl(apiEndpoint)) {
          onStatusChange?.({
            type: 'error',
            message: t('contextMenu.api.errors.fixUrlFormat'),
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
  }, [apiEndpoint, apiKey, selectedProvider, onStatusChange, testNonce, t]);

  return (
    <div className="space-y-4">
      {/* Provider Selector */}
      <div>
        <SearchableSelect
          label={t('contextMenu.api.providerLabel')}
          value={providerId || ''}
          onChange={(val) => onProviderChange(val as AiProviderId)}
          options={providerOptions}
          placeholder={t('contextMenu.api.providerPlaceholder')}
          className="w-full"
          isFilterable={false}
        />
        {selectedProvider && (
          <div className="mt-2 text-xs text-gray-600">
            <div className="font-medium text-gray-700">
              {selectedProvider.baseUrl
                ? `${t('contextMenu.api.baseUrl')}: ${selectedProvider.baseUrl}`
                : t('contextMenu.api.customProvider')}
            </div>
            {selectedProvider.docsUrl && (
              <a
                href={selectedProvider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {t('contextMenu.api.viewDocs')}
              </a>
            )}
          </div>
        )}
      </div>

      {/* API Endpoint Field - Only shown for Custom provider */}
      {isCustomProvider && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('contextMenu.api.baseUrl')}
          </label>
          <input
            type="text"
            value={apiEndpoint}
            onChange={(e) => onApiEndpointChange(e.target.value)}
            placeholder={t('contextMenu.api.baseUrlPlaceholder')}
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
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('contextMenu.api.apiKey')}
        </label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={t('contextMenu.api.apiKeyPlaceholder')}
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
