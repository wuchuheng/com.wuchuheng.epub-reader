import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiConfig, type ApiStatus } from './components/ApiConfig';
import { ModelSearchInput } from './components/ModelSearchInput';
import { ToolList } from './components/ToolList';
import { useContextMenuSettings } from './hooks/useContextMenuSettings';

const getStatusBg = (status: ApiStatus['type']) => {
  switch (status) {
    case 'success':
      return 'border-green-200 bg-green-50';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50';
    case 'error':
      return 'border-red-200 bg-red-50';
    default:
      return 'border-gray-200 bg-gray-50';
  }
};

const getStatusColor = (status: ApiStatus['type']) => {
  switch (status) {
    case 'success':
      return 'text-green-700';
    case 'warning':
      return 'text-yellow-700';
    case 'error':
      return 'text-red-700';
    default:
      return 'text-gray-700';
  }
};

const getStatusIcon = (status: ApiStatus['type']) => {
  switch (status) {
    case 'success':
      return '[OK]';
    case 'warning':
      return '[!]';
    case 'error':
      return '[X]';
    default:
      return '[ ]';
  }
};

/**
 * Context Menu Settings page component.
 * Configuration for AI providers and context menu settings.
 * Follows high cohesion and low coupling principles.
 */
export const ContextMenuSettingsPage: React.FC = () => {
  // 1. State and logic using custom hooks
  const contextMenuSettings = useContextMenuSettings();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);

  const handleSaveSettings = async () => {
    // Validation: Check if default model is set when AI tools exist
    const hasAITools = contextMenuSettings.settings.items.some((item) => item.type === 'AI');
    if (hasAITools && !contextMenuSettings.settings.defaultModel) {
      alert('Please select a Default Model for your AI tools.');
      return;
    }

    const success = await contextMenuSettings.saveSettings();
    if (success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // 3. Render
  return (
    <div className="space-y-6 text-black">
      {/* Loading State */}
      {contextMenuSettings.isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      )}

      {/* Error State */}
      {contextMenuSettings.error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-red-700">{contextMenuSettings.error}</div>
        </div>
      )}

      {/* Main Content */}
      {!contextMenuSettings.isLoading && (
        <>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Context Menu Configuration</h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure AI providers and custom tools for the reader context menu.
            </p>
          </div>

          {/* API Configuration */}
          <ApiConfig
            providerId={contextMenuSettings.settings.providerId}
            apiEndpoint={contextMenuSettings.settings.api || ''}
            apiKey={contextMenuSettings.settings.key || ''}
            onProviderChange={contextMenuSettings.updateProvider}
            onApiEndpointChange={contextMenuSettings.updateApiEndpoint}
            onApiKeyChange={contextMenuSettings.updateApiKey}
            onStatusChange={setApiStatus}
          />

          {/* Global Default Model Configuration */}
          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">Model</label>
            <ModelSearchInput
              value={contextMenuSettings.settings.defaultModel || ''}
              onChange={contextMenuSettings.updateDefaultModel}
              apiEndpoint={contextMenuSettings.settings.api || ''}
              apiKey={contextMenuSettings.settings.key || ''}
              placeholder="Search or enter model name (e.g. gpt-3.5-turbo)"
            />
          </div>

          {/* API Status Notification */}
          {apiStatus && (
            <div
              className={`mb-6 flex flex-col gap-1 rounded-md border px-2 py-1 text-xs ${getStatusBg(
                apiStatus.type
              )}`}
            >
              {apiStatus.isTesting ? (
                <div className="flex items-center text-blue-600">
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <span className="leading-tight">Testing API connection...</span>
                </div>
              ) : (
                <div className={`${getStatusColor(apiStatus.type)} leading-tight`}>
                  <span>
                    {getStatusIcon(apiStatus.type)} {apiStatus.message}
                  </span>
                  {apiStatus.link && (
                    <div className="ml-5 mt-0.5">
                      <a
                        href={apiStatus.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-800"
                      >
                        Get API Key / Help
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Custom AI Tools Section */}
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900">Custom AI Tools</h4>
              <Link
                to="/settings/contextmenu/add-tool"
                className="rounded-md bg-blue-500 px-3 py-1 text-white transition-colors hover:bg-blue-600"
              >
                + Add New Tool
              </Link>
            </div>

            {/* Existing Tools List */}
            <ToolList
              tools={contextMenuSettings.settings.items || []}
              onToolRemove={contextMenuSettings.removeTool}
              onToolReorder={contextMenuSettings.reorderTools}
              onToggleDefault={contextMenuSettings.toggleDefaultTool}
            />
          </div>

          {/* Save Settings Section */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={contextMenuSettings.isSaving}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {contextMenuSettings.isSaving ? 'Saving...' : 'Save Settings'}
                </button>

                {/* Save Status Feedback */}
                {saveStatus === 'success' && (
                  <div className="text-green-600">Settings saved successfully!</div>
                )}
                {saveStatus === 'error' && (
                  <div className="text-red-600">Failed to save settings</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Default export for router
export default ContextMenuSettingsPage;
