import { useState, useCallback } from 'react';
import { ContextMenuItem, AISettingItem, IframeSettingItem, SelectionSituation } from '../../../types/epub';

/**
 * Hook for managing tool creation form state and logic.
 * Encapsulates form validation and tool creation logic.
 */
export const useToolForm = () => {
  // 1. State management
  const [toolType, setToolType] = useState<ContextMenuItem['type']>('AI');
  const [toolName, setToolName] = useState('');
  const [toolShortName, setToolShortName] = useState('');
  const [toolPrompt, setToolPrompt] = useState('');
  const [toolUrl, setToolUrl] = useState('');
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  const [enabled, setEnabledState] = useState(true);
  const [defaultFor, setDefaultFor] = useState<SelectionSituation | undefined>(undefined);

  // 2. Validation logic
  const isValid = useCallback(() => {
    if (!toolName.trim()) return false;
    
    if (toolType === 'AI') {
      return toolPrompt.trim() !== '';
    } else {
      return toolUrl.trim() !== '';
    }
  }, [toolName, toolPrompt, toolUrl, toolType]);

  // 3. Tool creation logic
  const createTool = useCallback((): ContextMenuItem | null => {
    if (!isValid()) return null;

    // Use user-provided short name or auto-generate if empty
    const shortName = toolShortName.trim() || 
      (toolName.length > 10 ? toolName.substring(0, 10) + '...' : toolName);

    if (toolType === 'AI') {
      const newTool: AISettingItem = {
        type: 'AI',
        name: toolName.trim(),
        shortName,
        prompt: toolPrompt.trim(),
        reasoningEnabled,
        enabled,
        defaultFor,
      };
      return newTool;
    } else {
      const newTool: IframeSettingItem = {
        type: 'iframe',
        name: toolName.trim(),
        shortName,
        url: toolUrl.trim(),
        enabled,
        defaultFor,
      };
      return newTool;
    }
  }, [toolName, toolShortName, toolPrompt, toolUrl, reasoningEnabled, toolType, isValid, defaultFor, enabled]);

  // 4. Reset logic
  const resetForm = useCallback(() => {
    setToolType('AI');
    setToolName('');
    setToolShortName('');
    setToolPrompt('');
    setToolUrl('');
    setReasoningEnabled(false);
    setEnabledState(true);
    setDefaultFor(undefined);
  }, []);

  const loadTool = useCallback((tool: ContextMenuItem) => {
    setToolType(tool.type);
    setToolName(tool.name);
    setToolShortName(tool.shortName || '');
    setEnabledState(tool.enabled ?? true);
    setDefaultFor(tool.enabled === false ? undefined : tool.defaultFor);

    if (tool.type === 'AI') {
      setToolPrompt(tool.prompt);
      setReasoningEnabled(Boolean(tool.reasoningEnabled));
      setToolUrl('');
    } else {
      setToolUrl(tool.url);
      setToolPrompt('');
      setReasoningEnabled(false);
    }
  }, []);

  // 5. Export interface
  return {
    // State
    toolType,
    toolName,
    toolShortName,
    toolPrompt,
    toolUrl,
    reasoningEnabled,
    enabled,
    defaultFor,
    
    // Actions
    setToolType,
    setToolName,
    setToolShortName,
    setToolPrompt,
    setToolUrl,
    setReasoningEnabled,
    setDefaultFor,
    setEnabled: (value: boolean) => {
      setEnabledState(value);
      if (!value) {
        setDefaultFor(undefined);
      }
    },

    // Computed
    isValid,
    createTool,
    resetForm,
    loadTool,
  };
};

/**
 * Type for the hook return value
 */
export type ToolFormHook = ReturnType<typeof useToolForm>;
