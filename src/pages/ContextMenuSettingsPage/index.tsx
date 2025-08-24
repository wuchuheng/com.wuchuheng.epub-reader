import React, { useState } from 'react';
import { ContextMenuSettings, AISettingItem } from '../../types/epub';
import { Breadcrumb } from '../../components/Breadcrumb';
import { BackButton } from '../../components/BackButton';
import { Container } from '../../components/Container';

/**
 * Context Menu Settings page component
 * Configuration for AI providers and context menu settings
 */
export const ContextMenuSettingsPage: React.FC = () => {
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

  const [newToolName, setNewToolName] = useState('');
  const [newToolPrompt, setNewToolPrompt] = useState('');
  const [newToolModel, setNewToolModel] = useState('gpt-3.5-turbo');

  const updateSettings = (field: keyof ContextMenuSettings, value: string | AISettingItem[]) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

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

    setNewToolName('');
    setNewToolPrompt('');
  };

  const removeTool = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateTool = (index: number, updatedTool: Partial<AISettingItem>) => {
    setSettings((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...updatedTool } : item)),
    }));
  };

  return (
    <Container
      breadcrumbItems={[
        { label: 'Home', path: '/' },
        { label: 'Settings', path: '/settings' },
        { label: 'Context Menu' },
      ]}
      backTo="/settings"
    >
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Context Menu Configuration</h3>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">API Endpoint</label>
            <input
              type="text"
              value={settings.api}
              onChange={(e) => updateSettings('api', e.target.value)}
              placeholder="https://api.example.com/v1"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">API Key</label>
            <input
              type="password"
              value={settings.key}
              onChange={(e) => updateSettings('key', e.target.value)}
              placeholder="Your API key"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

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

            <div className="space-y-3">
              {settings.items.map((item, index) => (
                <div key={index} className="rounded-md border border-gray-200 p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.shortName}</p>
                    </div>
                    <button
                      onClick={() => removeTool(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm text-gray-700">Prompt</label>
                      <textarea
                        value={item.prompt}
                        onChange={(e) => updateTool(index, { prompt: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm text-gray-700">Model</label>
                      <select
                        value={item.model}
                        onChange={(e) => updateTool(index, { model: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      >
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="claude-3-haiku">Claude 3 Haiku</option>
                        <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-md bg-gray-50 p-4">
              <h5 className="mb-3 font-medium text-gray-900">Add New Tool</h5>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-700">Tool Name</label>
                  <input
                    type="text"
                    value={newToolName}
                    onChange={(e) => setNewToolName(e.target.value)}
                    placeholder="e.g., Simple Explanation"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700">Prompt</label>
                  <textarea
                    value={newToolPrompt}
                    onChange={(e) => setNewToolPrompt(e.target.value)}
                    placeholder="e.g., Explain {selectedText} in simple terms"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-700">Model</label>
                  <select
                    value={newToolModel}
                    onChange={(e) => setNewToolModel(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  </select>
                </div>
              </div>
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
