import React, { useState, useEffect } from 'react';

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
 * Shows field errors only when they occur, and summary status at the bottom.
 */
export const ApiConfig: React.FC<ApiConfigProps> = ({
  apiEndpoint,
  apiKey,
  onApiEndpointChange,
  onApiKeyChange,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [summaryStatus, setSummaryStatus] = useState<{
    type: 'error' | 'warning' | 'success';
    message: string;
  } | null>(null);

  // Field error states (only show errors)
  const [endpointError, setEndpointError] = useState<string>('');
  const [keyError, setKeyError] = useState<string>('');

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
      setEndpointError('API endpoint is required');
    } else {
      setEndpointError('');
    }
  }, [apiEndpoint, apiKey]);

  useEffect(() => {
    // Show key error only if:
    // 1. Other field has content but this one is empty
    // 2. Don't show if URL is invalid (prioritize URL error first)
    const shouldShowKeyError = apiKey.length === 0 && 
                              apiEndpoint.length > 0 && 
                              isValidUrl(apiEndpoint);
    
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
        setIsTesting(true);
        try {
          const response = await fetch(`${apiEndpoint}/models`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            const modelCount = data.data && Array.isArray(data.data) ? data.data.length : 0;
            setSummaryStatus({
              type: 'success',
              message: modelCount > 0 ? `API connected successfully (${modelCount} models available)` : 'API connected successfully'
            });
          } else {
            setSummaryStatus({
              type: 'error',
              message: `API connection failed: ${response.status} ${response.statusText}`
            });
          }
        } catch (error) {
          setSummaryStatus({
            type: 'error',
            message: `Network error: ${error instanceof Error ? error.message : 'Connection failed'}`
          });
        } finally {
          setIsTesting(false);
        }
      } else {
        // Set summary status based on form state
        if (!apiEndpoint && !apiKey) {
          setSummaryStatus({
            type: 'warning',
            message: 'Please enter API endpoint and key to test connection'
          });
        } else if (!apiEndpoint) {
          setSummaryStatus({
            type: 'warning',
            message: 'Please enter API endpoint'
          });
        } else if (!apiKey) {
          setSummaryStatus({
            type: 'warning',
            message: 'Please enter API key'
          });
        } else if (!isValidUrl(apiEndpoint)) {
          setSummaryStatus({
            type: 'error',
            message: 'Please fix API endpoint format'
          });
        } else {
          setSummaryStatus(null);
        }
      }
    };

    // Debounce the API test
    const timeoutId = setTimeout(testApiConnection, 1000);
    return () => clearTimeout(timeoutId);
  }, [apiEndpoint, apiKey]);

  const getStatusColor = (type: 'error' | 'warning' | 'success') => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (type: 'error' | 'warning' | 'success') => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* API Endpoint Field */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          API Endpoint
        </label>
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
        {endpointError && (
          <div className="mt-1 text-sm text-red-600">
            {endpointError}
          </div>
        )}
      </div>

      {/* API Key Field */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="Your API key"
          className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
            keyError 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        {keyError && (
          <div className="mt-1 text-sm text-red-600">
            {keyError}
          </div>
        )}
      </div>

      {/* Summary Status Line */}
      {summaryStatus && (
        <div className="flex items-center justify-between p-3 rounded-md border">
          <div className="flex items-center">
            {isTesting ? (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm">Testing API connection...</span>
              </div>
            ) : (
              <div className={`text-sm ${getStatusColor(summaryStatus.type)}`}>
                {getStatusIcon(summaryStatus.type)} {summaryStatus.message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
