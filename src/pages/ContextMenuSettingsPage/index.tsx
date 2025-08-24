import React from 'react';
import { ContextMenuItem } from '../../types/epub';
import { Container } from '../../components/Container';
import { ApiConfig } from './components/ApiConfig';
import { ToolList } from './components/ToolList';
import { AddToolDialog } from './components/AddToolDialog';
import { useContextMenuSettings } from './hooks/useContextMenuSettings';
import { useDialog } from './hooks/useDialog';

/**
 * Context Menu Settings page component.
 * Configuration for AI providers and context menu settings.
 * Follows high cohesion and low coupling principles.
 */
export const ContextMenuSettingsPage: React.FC = () => {
  // 1. State and logic using custom hooks
  const settings = useContextMenuSettings();
  const dialog = useDialog();

  // 2. Event handlers
  const handleAddTool = (tool: ContextMenuItem) => {
    settings.addTool(tool);
    dialog.close();
  };

  // 3. Render
  return (
    <Container
      breadcrumbItems={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Context Menu' },
      ]}
      backTo="/settings"
    >
      <div className="rounded-lg bg-white p-6 text-black shadow">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Context Menu Configuration</h3>

          {/* API Configuration */}
          <ApiConfig
            apiEndpoint={settings.settings.api}
            apiKey={settings.settings.key}
            onApiEndpointChange={settings.updateApiEndpoint}
            onApiKeyChange={settings.updateApiKey}
          />

          {/* Custom AI Tools Section */}
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900">Custom AI Tools</h4>
              <button
                onClick={dialog.open}
                className="rounded-md bg-blue-500 px-3 py-1 text-white transition-colors hover:bg-blue-600"
              >
                + Add New Tool
              </button>
            </div>

            {/* Existing Tools List */}
            <ToolList
              tools={settings.settings.items}
              onToolUpdate={settings.updateTool}
              onToolRemove={settings.removeTool}
              apiEndpoint={settings.settings.api}
              apiKey={settings.settings.key}
            />
          </div>
        </div>

        {/* Add Tool Dialog */}
        <AddToolDialog
          isOpen={dialog.isOpen}
          onClose={dialog.close}
          onAddTool={handleAddTool}
          apiEndpoint={settings.settings.api}
          apiKey={settings.settings.key}
        />

        <div className="mt-8 border-t border-gray-200 pt-6">
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            Save Settings
          </button>
        </div>
      </div>
    </Container>
  );
};

// Default export for router
export default ContextMenuSettingsPage;