import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiConfig, type ApiStatus } from './components/ApiConfig';
import { ModelSearchInput } from './components/ModelSearchInput';
import { ToolList } from './components/ToolList';
import { SectionCard } from './components/SectionCard';
import { useContextMenuSettings } from './hooks/useContextMenuSettings';

const getStatusIcon = (status: ApiStatus | null) => {
  if (!status) return '[ ]';
  if (status.isTesting) return '…';

  switch (status.type) {
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
  const [testNonce, setTestNonce] = useState(0);

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

  const handleTestConnection = () => {
    const { api, key } = contextMenuSettings.settings;
    if (!api || !key) {
      setApiStatus({
        type: 'warning',
        message: 'Add Base URL and API key to test connection',
        isTesting: false,
      });
    } else {
      setApiStatus({ type: 'success', message: 'Testing API connection...', isTesting: true });
    }
    setTestNonce((prev) => prev + 1);
  };

  const renderStatusChip = () => {
    const baseClasses =
      'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium';
    let variant = 'border-gray-200 bg-gray-50 text-gray-700';
    let label = 'Not tested';

    if (apiStatus?.isTesting) {
      variant = 'border-blue-200 bg-blue-50 text-blue-700';
      label = 'Testing';
    } else if (apiStatus?.type === 'success') {
      variant = 'border-green-200 bg-green-50 text-green-700';
      label = 'OK';
    } else if (apiStatus?.type === 'warning') {
      variant = 'border-yellow-200 bg-yellow-50 text-yellow-700';
      label = 'Needs input';
    } else if (apiStatus?.type === 'error') {
      variant = 'border-red-200 bg-red-50 text-red-700';
      label = 'Error';
    }

    return (
      <div className={`${baseClasses} ${variant}`}>
        {apiStatus?.isTesting ? (
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        ) : (
          <span className="text-[10px]">{getStatusIcon(apiStatus)}</span>
        )}
        <span>{label}</span>
      </div>
    );
  };

  const renderStatusBanner = () => {
    if (!apiStatus) return null;

    const colors = (() => {
      if (apiStatus.isTesting) return { bg: 'bg-blue-50 border-blue-200 text-blue-700', dot: 'bg-blue-500' };
      if (apiStatus.type === 'success')
        return { bg: 'bg-green-50 border-green-200 text-green-700', dot: 'bg-green-500' };
      if (apiStatus.type === 'warning')
        return { bg: 'bg-yellow-50 border-yellow-200 text-yellow-700', dot: 'bg-yellow-500' };
      if (apiStatus.type === 'error')
        return { bg: 'bg-red-50 border-red-200 text-red-700', dot: 'bg-red-500' };
      return { bg: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' };
    })();

    return (
      <div
        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium ${colors.bg}`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} aria-hidden />
        <span className="flex-1 leading-tight">{apiStatus.message}</span>
        {apiStatus.link && (
          <a
            href={apiStatus.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-blue-700 underline hover:text-blue-800"
          >
            Help
          </a>
        )}
      </div>
    );
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

          <div className="grid gap-6 lg:grid-cols-[minmax(320px,1fr)_minmax(0,2fr)]">
            {/* Provider & Authentication */}
            <SectionCard
              title="AI Provider"
              description="Connect your model provider for AI tools."
              statusSlot={renderStatusChip()}
              tint="sky"
            >
              <ApiConfig
                providerId={contextMenuSettings.settings.providerId}
                apiEndpoint={contextMenuSettings.settings.api || ''}
                apiKey={contextMenuSettings.settings.key || ''}
                onProviderChange={contextMenuSettings.updateProvider}
                onApiEndpointChange={contextMenuSettings.updateApiEndpoint}
                onApiKeyChange={contextMenuSettings.updateApiKey}
                onStatusChange={setApiStatus}
                testNonce={testNonce}
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Default Model</label>
                  <span className="text-xs text-gray-500">Used unless a tool overrides it</span>
                </div>
                <ModelSearchInput
                  value={contextMenuSettings.settings.defaultModel || ''}
                  onChange={contextMenuSettings.updateDefaultModel}
                  apiEndpoint={contextMenuSettings.settings.api || ''}
                  apiKey={contextMenuSettings.settings.key || ''}
                  placeholder="Search or enter model name (e.g. gpt-3.5-turbo)"
                />
              </div>

              {renderStatusBanner()}
            </SectionCard>

            {/* Custom Tools */}
            <SectionCard
              title="Custom AI Tools"
              description="Shown in the reader context menu in this order."
              statusSlot={
                <div className="hidden text-xs text-gray-500 sm:block">Drag to reorder</div>
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600">
                  Arrange and scope your tools. Word/Sentence toggles set the default scope.
                </p>
                <Link
                  to="/settings/contextmenu/add-tool"
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                >
                  + Add Tool
                </Link>
              </div>

              <ToolList
                tools={contextMenuSettings.settings.items || []}
                onToolRemove={contextMenuSettings.removeTool}
                onToolReorder={contextMenuSettings.reorderTools}
                onToggleDefault={contextMenuSettings.toggleDefaultTool}
              />
            </SectionCard>
          </div>

          {/* Sticky Actions */}
          <div className="sticky bottom-0 z-20 mt-6 border-t border-gray-200 bg-white/95 px-4 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={contextMenuSettings.isSaving}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {apiStatus?.isTesting ? 'Testing…' : 'Test connection'}
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={contextMenuSettings.isSaving}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {contextMenuSettings.isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>

              <div className="text-sm">
                {saveStatus === 'success' && (
                  <span className="text-green-600">Settings saved successfully!</span>
                )}
                {saveStatus === 'error' && <span className="text-red-600">Failed to save settings</span>}
                {contextMenuSettings.isSaving && <span className="text-gray-600">Saving changes…</span>}
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
