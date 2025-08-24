import { useCallback, useState } from 'react';
import { ContextMenuSettings, ContextMenuItem } from '../../../types/epub';

/**
 * Hook for managing context menu settings state and operations.
 * Encapsulates all settings-related logic and state management.
 */
export const useContextMenuSettings = () => {
  // 1. State management
  const [settings, setSettings] = useState<ContextMenuSettings>({
    api: '',
    key: '',
    items: [],
  });

  // 2. Actions
  const updateSettings = useCallback((field: keyof ContextMenuSettings, value: string | ContextMenuItem[]) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateApiEndpoint = useCallback((endpoint: string) => {
    updateSettings('api', endpoint);
  }, [updateSettings]);

  const updateApiKey = useCallback((key: string) => {
    updateSettings('key', key);
  }, [updateSettings]);

  const addTool = useCallback((tool: ContextMenuItem) => {
    setSettings((prev) => ({
      ...prev,
      items: [...prev.items, tool],
    }));
  }, []);

  const removeTool = useCallback((index: number) => {
    setSettings((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  const updateTool = useCallback((index: number, updatedTool: Partial<ContextMenuItem>) => {
    setSettings((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...updatedTool } : item)),
    }));
  }, []);

  // 3. Export interface
  return {
    // State
    settings,
    
    // Actions
    updateSettings,
    updateApiEndpoint,
    updateApiKey,
    addTool,
    removeTool,
    updateTool,
  };
};

/**
 * Type for the hook return value
 */
export type ContextMenuSettingsHook = ReturnType<typeof useContextMenuSettings>;