import { useCallback, useState, useEffect, useRef } from 'react';
import { ContextMenuSettings, ContextMenuItem } from '../../../types/epub';
import { getContextMenuSettings, updateContextMenuSettings } from '../../../services/OPFSManager';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref for accessing current settings in async operations
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // 2. Load settings from OPFS on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const savedSettings = await getContextMenuSettings();

        // Ensure we have valid settings object
        const validSettings = {
          api: savedSettings?.api || '',
          key: savedSettings?.key || '',
          items: savedSettings?.items || [],
        };

        setSettings(validSettings);
      } catch (err) {
        setError('Failed to load settings');
        console.error('Error loading context menu settings:', err);
        // Set default settings on error
        setSettings({
          api: '',
          key: '',
          items: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // 2. Actions
  const updateSettings = useCallback(
    (field: keyof ContextMenuSettings, value: string | ContextMenuItem[]) => {
      setSettings((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateApiEndpoint = useCallback(
    (endpoint: string) => {
      updateSettings('api', endpoint);
    },
    [updateSettings]
  );

  const updateApiKey = useCallback(
    (key: string) => {
      updateSettings('key', key);
    },
    [updateSettings]
  );

  const addTool = useCallback(
    async (tool: ContextMenuItem) => {
      const newSettings = { ...settings, items: [...settings.items, tool] };
      await updateContextMenuSettings(newSettings);
      setSettings(newSettings);
    },
    [settings]
  );

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

  // 3. Save settings to OPFS
  const saveSettings = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      await updateContextMenuSettings(settings);
      return true;
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving context menu settings:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  // 4. Export interface
  return {
    // State
    settings,
    isLoading,
    isSaving,
    error,

    // Actions
    updateSettings,
    updateApiEndpoint,
    updateApiKey,
    addTool,
    removeTool,
    updateTool,
    saveSettings,
  };
};

/**
 * Type for the hook return value
 */
export type ContextMenuSettingsHook = ReturnType<typeof useContextMenuSettings>;
