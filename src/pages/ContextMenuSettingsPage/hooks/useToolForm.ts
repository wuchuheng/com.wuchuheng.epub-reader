import { useState, useCallback } from 'react';
import { ContextMenuItem, AISettingItem, IframeSettingItem } from '../../../types/epub';

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
  const [supportsSingleWord, setSupportsSingleWord] = useState(true);
  const [supportsMultiWord, setSupportsMultiWord] = useState(true);

  const normalizeSupports = useCallback((nextSingle: boolean, nextMulti: boolean) => {
    if (!nextSingle && !nextMulti) {
      setSupportsSingleWord(true);
      setSupportsMultiWord(false);
      return;
    }
    setSupportsSingleWord(nextSingle);
    setSupportsMultiWord(nextMulti);
  }, []);

  // 2. Validation logic
  const isValid = useCallback(() => {
    if (!toolName.trim()) return false;
    if (!supportsSingleWord && !supportsMultiWord) return false;
    
    if (toolType === 'AI') {
      return toolPrompt.trim() !== '';
    } else {
      return toolUrl.trim() !== '';
    }
  }, [toolName, toolPrompt, toolUrl, toolType, supportsSingleWord, supportsMultiWord]);

  // 3. Tool creation logic
  const createTool = useCallback((): ContextMenuItem | null => {
    if (!isValid()) return null;
    if (!supportsSingleWord && !supportsMultiWord) return null;

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
        supportsSingleWord,
        supportsMultiWord,
      };
      return newTool;
    } else {
      const newTool: IframeSettingItem = {
        type: 'iframe',
        name: toolName.trim(),
        shortName,
        url: toolUrl.trim(),
        enabled,
        supportsSingleWord,
        supportsMultiWord,
      };
      return newTool;
    }
  }, [
    toolName,
    toolShortName,
    toolPrompt,
    toolUrl,
    reasoningEnabled,
    toolType,
    isValid,
    supportsSingleWord,
    supportsMultiWord,
    enabled,
  ]);

  // 4. Reset logic
  const resetForm = useCallback(() => {
    setToolType('AI');
    setToolName('');
    setToolShortName('');
    setToolPrompt('');
    setToolUrl('');
    setReasoningEnabled(false);
    setEnabledState(true);
    setSupportsSingleWord(true);
    setSupportsMultiWord(true);
  }, []);

  const loadTool = useCallback((tool: ContextMenuItem) => {
    setToolType(tool.type);
    setToolName(tool.name);
    setToolShortName(tool.shortName || '');
    setEnabledState(tool.enabled ?? true);
    const nextSingle = tool.supportsSingleWord !== false;
    const nextMulti = tool.supportsMultiWord !== false;
    normalizeSupports(nextSingle, nextMulti);

    if (tool.type === 'AI') {
      setToolPrompt(tool.prompt);
      setReasoningEnabled(Boolean(tool.reasoningEnabled));
      setToolUrl('');
    } else {
      setToolUrl(tool.url);
      setToolPrompt('');
      setReasoningEnabled(false);
    }
  }, [normalizeSupports]);

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
    supportsSingleWord,
    supportsMultiWord,
    
    // Actions
    setToolType,
    setToolName,
    setToolShortName,
    setToolPrompt,
    setToolUrl,
    setReasoningEnabled,
    setSupportsSingleWord: (value: boolean) => normalizeSupports(value, supportsMultiWord),
    setSupportsMultiWord: (value: boolean) => normalizeSupports(supportsSingleWord, value),
    setEnabled: (value: boolean) => {
      setEnabledState(value);
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
