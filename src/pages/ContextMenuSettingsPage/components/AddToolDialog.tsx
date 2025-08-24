import React, { useEffect } from 'react';
import { ContextMenuItem, ContextMenuItemCommon } from '../../../types/epub';
import { useToolForm } from '../hooks/useToolForm';
import { ToolTypeSelector } from './ToolTypeSelector';
import { AIToolForm } from './AIToolForm';
import { IframeToolForm } from './IframeToolForm';

/**
 * Props for add tool dialog component.
 */
interface AddToolDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Handler for closing the dialog. */
  onClose: () => void;
  /** Handler for adding a new tool. */
  onAddTool: (tool: ContextMenuItem) => void;
  /** API endpoint for fetching models. */
  apiEndpoint?: string;
  /** API key for authentication. */
  apiKey?: string;
}

/**
 * Dialog component for adding new AI or iframe tools.
 * Features dynamic form fields based on tool type selection.
 * Follows high cohesion and low coupling principles.
 */
export const AddToolDialog: React.FC<AddToolDialogProps> = ({
  isOpen,
  onClose,
  onAddTool,
  apiEndpoint,
  apiKey,
}) => {
  // 1. Form state and logic using custom hook
  const form = useToolForm();

  // 2. Effects
  // 2.1 Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      form.resetForm();
    }
  }, [isOpen, form.resetForm]);

  // 3. Event handlers
  // 3.1 Handle form submission
  const handleSubmit = () => {
    const newTool = form.createTool();
    if (newTool) {
      onAddTool(newTool);
    }
  };

  // 3.2 Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  // 4. Render
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Add New Tool</h3>
          <p className="text-sm text-gray-600">Configure a new AI tool or iframe tool</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Tool Type Selection */}
          <ToolTypeSelector
            selectedType={form.toolType}
            onTypeChange={form.setToolType}
          />

          {/* Tool Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tool Name
            </label>
            <input
              type="text"
              value={form.toolName}
              onChange={(e) => form.setToolName(e.target.value)}
              placeholder="e.g., Simple Explanation"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          {/* Short Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Short Name <span className="text-xs text-gray-500">(optional, max 15 chars)</span>
            </label>
            <input
              type="text"
              value={form.toolShortName}
              onChange={(e) => form.setToolShortName(e.target.value)}
              placeholder="e.g., Simple Exp"
              maxLength={15}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to auto-generate from tool name
            </p>
          </div>

          {/* Dynamic Fields Based on Tool Type */}
          {form.toolType === 'AI' as ContextMenuItemCommon['type'] ? (
            <AIToolForm
              prompt={form.toolPrompt}
              model={form.toolModel}
              reasoningEnabled={form.reasoningEnabled}
              apiEndpoint={apiEndpoint}
              apiKey={apiKey}
              onPromptChange={form.setToolPrompt}
              onModelChange={form.setToolModel}
              onReasoningToggle={form.setReasoningEnabled}
            />
          ) : (
            <IframeToolForm
              url={form.toolUrl}
              onUrlChange={form.setToolUrl}
            />
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!form.isValid()}
            className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Tool
          </button>
        </div>
      </div>
    </div>
  );
};