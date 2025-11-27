import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiConfig } from './components/ApiConfig';
import { ToolList } from './components/ToolList';
import { useContextMenuSettings } from './hooks/useContextMenuSettings';

/**
 * Context Menu Settings page component.
 * Configuration for AI providers and context menu settings.
 * Follows high cohesion and low coupling principles.
 */
export const ContextMenuSettingsPage: React.FC = () => {
  // 1. State and logic using custom hooks
  const contextMenuSettings = useContextMenuSettings();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSaveSettings = async () => {
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
            apiEndpoint={contextMenuSettings.settings.api || ''}
            apiKey={contextMenuSettings.settings.key || ''}
            onApiEndpointChange={contextMenuSettings.updateApiEndpoint}
            onApiKeyChange={contextMenuSettings.updateApiKey}
          />

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