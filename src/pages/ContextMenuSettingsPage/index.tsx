import React, { useState } from 'react';
import { ContextMenuSettings, AISettingItem } from '../../types/epub';
import { Container } from '../../components/Container';
import { ApiConfig } from './components/ApiConfig';
import { ToolList } from './components/ToolList';
import { ToolForm } from './components/ToolForm';

/**
 * Context Menu Settings page component.
 * Configuration for AI providers and context menu settings.
 */
export const ContextMenuSettingsPage: React.FC = () => {
  // 1. Input handling
  // 1.1 Initialize settings state with default AI tools
  const [settings, setSettings] = useState<ContextMenuSettings>({
    api: '',
    key: '',
    items: [
      {
        type: 'AI',
        name: 'Simple Explanation',
        shortName: 'Simple',
        prompt: 'Explain {selectedText} in simple terms',
        model: 'gpt-3.5-turbo',
        reasoningEnabled: false,
      },
      {
        type: 'AI',
        name: 'Spanish Translation',
        shortName: 'Spanish',
        prompt: 'Translate {selectedText} to Spanish',
        model: 'gpt-3.5-turbo',
        reasoningEnabled: false,
      },
    ],
  });

  // 1.2 Initialize new tool form state
  const [newToolName, setNewToolName] = useState('');
  const [newToolPrompt, setNewToolPrompt] = useState('');
  const [newToolModel, setNewToolModel] = useState('gpt-3.5-turbo');

  // 2. Core processing
  // 2.1 Settings update handler
  const updateSettings = (field: keyof ContextMenuSettings, value: string | AISettingItem[]) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  // 2.2 Tool creation handler
  const addNewTool = () => {
    if (!newToolName || !newToolPrompt) return;

    const newTool: AISettingItem = {
      type: 'AI',
      name: newToolName,
      shortName: newToolName.length > 10 ? newToolName.substring(0, 10) + '...' : newToolName,
      prompt: newToolPrompt,
      model: newToolModel,
      reasoningEnabled: false,
    };

    setSettings((prev) => ({
      ...prev,
      items: [...prev.items, newTool],
    }));

    // Reset form
    setNewToolName('');
    setNewToolPrompt('');
  };

  // 2.3 Tool removal handler
  const removeTool = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // 2.4 Tool update handler
  const updateTool = (index: number, updatedTool: Partial<AISettingItem>) => {
    setSettings((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...updatedTool } : item)),
    }));
  };

  // 3. Output handling
  // 3.1 Render settings page with component composition
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
            apiEndpoint={settings.api}
            apiKey={settings.key}
            onApiEndpointChange={(value) => updateSettings('api', value)}
            onApiKeyChange={(value) => updateSettings('key', value)}
          />

          {/* Custom AI Tools Section */}
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900">Custom AI Tools</h4>
              <button
                onClick={addNewTool}
                disabled={!newToolName || !newToolPrompt}
                className="rounded-md bg-blue-500 px-3 py-1 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
              >
                + Add New Tool
              </button>
            </div>

            {/* Existing Tools List */}
            <ToolList tools={settings.items} onToolUpdate={updateTool} onToolRemove={removeTool} />

            {/* Add New Tool Form */}
            <div className="mt-6 rounded-md bg-gray-50 p-4">
              <h5 className="mb-3 font-medium text-gray-900">Add New Tool</h5>
              <ToolForm
                showNameField={true}
                defaultName={newToolName}
                defaultPrompt={newToolPrompt}
                defaultModel={newToolModel}
                onNameChange={setNewToolName}
                onPromptChange={setNewToolPrompt}
                onModelChange={setNewToolModel}
              />
            </div>
          </div>
        </div>

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
