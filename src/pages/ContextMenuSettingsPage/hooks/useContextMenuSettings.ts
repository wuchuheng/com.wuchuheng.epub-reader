import { useCallback, useState, useEffect, useRef } from 'react';
import { ContextMenuSettings, ContextMenuItem, SelectionSituation } from '../../../types/epub';
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

  /**
   * Ensures mutual exclusivity for default tools.
   * If the new/updated tool has a defaultFor set, this removes that defaultFor from all other tools.
   */
  const enforceDefaultExclusivity = (
    items: ContextMenuItem[],
    newItem: ContextMenuItem,
    excludeIndex: number = -1
  ): ContextMenuItem[] => {
    if (!newItem.defaultFor) return items;

    return items.map((item, index) => {
      // Skip the item currently being added/updated (it will be replaced later in the flow)
      if (index === excludeIndex) return item;

      // If another item has the same defaultFor, clear it
      if (item.defaultFor === newItem.defaultFor) {
        return { ...item, defaultFor: undefined };
      }
      return item;
    });
  };

  const addTool = useCallback(
    async (tool: ContextMenuItem) => {
      try {
        setIsSaving(true);
        setError(null);
        
        // Enforce exclusivity before adding
        let currentItems = settingsRef.current.items;
        if (tool.defaultFor) {
          currentItems = enforceDefaultExclusivity(currentItems, tool);
        }

        const newSettings = { ...settingsRef.current, items: [...currentItems, tool] };
        await updateContextMenuSettings(newSettings);
        setSettings(newSettings);
        return true;
      } catch (err) {
        setError('Failed to add tool');
        console.error('Error adding tool:', err);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    []
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
      items: prev.items.map((item, i) => (i === index ? { ...item, ...updatedTool } as ContextMenuItem : item)),
    }));
  }, []);

  const reorderTools = useCallback((fromIndex: number, toIndex: number) => {
    setSettings((prev) => {
      const newItems = [...prev.items];
      const [reorderedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, reorderedItem);
      return {
        ...prev,
        items: newItems,
      };
    });
  }, []);

  const saveTool = useCallback(
    async (index: number, updatedTool: ContextMenuItem) => {
      try {
        setIsSaving(true);
        setError(null);

        if (index < 0 || index >= settingsRef.current.items.length) {
          setError('Tool not found');
          return false;
        }

        let items = [...settingsRef.current.items];
        
        // Enforce exclusivity
        if (updatedTool.defaultFor) {
          items = enforceDefaultExclusivity(items, updatedTool, index);
        }
        
        items[index] = updatedTool;
        const newSettings = { ...settingsRef.current, items };

        await updateContextMenuSettings(newSettings);
        setSettings(newSettings);
        return true;
      } catch (err) {
        setError('Failed to update tool');
        console.error('Error updating tool:', err);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const toggleDefaultTool = useCallback(
    async (index: number, situation: SelectionSituation) => {
      try {
        setIsSaving(true);
        setError(null);
        
        const items = [...settingsRef.current.items];
        if (index < 0 || index >= items.length) return;

        const tool = items[index];
        const isAlreadyDefault = tool.defaultFor === situation;

        // Prepare the updated tool
        const updatedTool = {
          ...tool,
          defaultFor: isAlreadyDefault ? undefined : situation,
        };

        // If we are setting it (not unsetting), enforce exclusivity
        if (!isAlreadyDefault) {
           // Clear this situation from all other tools
           for (let i = 0; i < items.length; i++) {
             if (i !== index && items[i].defaultFor === situation) {
               items[i] = { ...items[i], defaultFor: undefined };
             }
           }
        }
        
        items[index] = updatedTool;
        const newSettings = { ...settingsRef.current, items };
        
        await updateContextMenuSettings(newSettings);
        setSettings(newSettings);
      } catch (err) {
        setError('Failed to toggle default tool');
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

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
    reorderTools,
    saveTool,
    saveSettings,
    toggleDefaultTool,
  };
};

/**
 * Type for the hook return value
 */
export type ContextMenuSettingsHook = ReturnType<typeof useContextMenuSettings>;
