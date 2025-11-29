import { useCallback, useState, useEffect, useRef } from 'react';
import { ContextMenuSettings, ContextMenuItem, SelectionSituation, AISettingItem } from '../../../types/epub';
import { getContextMenuSettings, updateContextMenuSettings } from '../../../services/OPFSManager';
import { AiProviderId, AI_PROVIDER_CATALOG } from '@/config/aiProviders';

/**
 * Hook for managing context menu settings state and operations.
 * Encapsulates all settings-related logic and state management.
 */
export const useContextMenuSettings = () => {
  // 1. State management
  const [settings, setSettings] = useState<ContextMenuSettings>({
    api: '',
    key: '',
    defaultModel: '',
    items: [],
    providerId: undefined,
    providerApiKeyCache: {},
    providerDefaultModelCache: {},
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

        const api = savedSettings.api || '';
        const key = savedSettings.key || '';

        let providerId = savedSettings.providerId;
        let providerApiKeyCache = savedSettings.providerApiKeyCache || {};
        let providerDefaultModelCache = savedSettings.providerDefaultModelCache || {};

        if (!providerId) {
          // Infer 'custom' if missing, and migrate existing config
          providerId = 'custom';
          // If we have an existing key but no cache for custom, seed it
          if (key && !providerApiKeyCache['custom']) {
            providerApiKeyCache = { ...providerApiKeyCache, custom: key };
          }
        }

        // Ensure active provider has a cached key
        if (key && !providerApiKeyCache[providerId]) {
          providerApiKeyCache = { ...providerApiKeyCache, [providerId]: key };
        }
        const activeKey = providerApiKeyCache[providerId] || '';

        // Seed default model cache from legacy fields
        const cachedDefaultModel = providerDefaultModelCache[providerId] || '';
        let defaultModel = cachedDefaultModel;
        if (!defaultModel) {
          const legacyDefaultModel = savedSettings.defaultModel;
          const firstAITool = savedSettings.items?.find(
            (item) => item.type === 'AI' && (item as AISettingItem).model
          ) as AISettingItem | undefined;
          const migratedModel = legacyDefaultModel || firstAITool?.model || '';

          if (migratedModel) {
            defaultModel = migratedModel;
            providerDefaultModelCache = {
              ...providerDefaultModelCache,
              [providerId]: migratedModel,
            };
          }
        }

        // Ensure we have valid settings object
        const validSettings: ContextMenuSettings = {
          api,
          key: activeKey,
          defaultModel,
          items: savedSettings?.items || [],
          providerId,
          providerApiKeyCache,
          providerDefaultModelCache,
        };

        setSettings(validSettings);
      } catch (err) {
        setError('Failed to load settings');
        console.error('Error loading context menu settings:', err);
        // Set default settings on error
        setSettings({
          api: '',
          key: '',
          defaultModel: '',
          items: [],
          providerId: 'custom',
          providerApiKeyCache: {},
          providerDefaultModelCache: {},
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // 2. Actions
  const updateSettings = useCallback(
    <K extends keyof ContextMenuSettings>(field: K, value: ContextMenuSettings[K]) => {
      setSettings((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  /**
   * Update the selected AI provider.
   * Handles switching base URL and restoring cached API key.
   */
  const updateProvider = useCallback((newProviderId: AiProviderId) => {
    setSettings((prev) => {
      const providerConfig = AI_PROVIDER_CATALOG.find((p) => p.id === newProviderId);
      
      // 1. Resolve Base URL
      let newBaseUrl = prev.api;
      if (providerConfig && providerConfig.baseUrl) {
        newBaseUrl = providerConfig.baseUrl;
      }

      // 2. Restore Cached Key
      const cachedKey = prev.providerApiKeyCache?.[newProviderId] || '';
      const cachedModel = prev.providerDefaultModelCache?.[newProviderId] || '';

      return {
        ...prev,
        providerId: newProviderId,
        api: newBaseUrl,
        key: cachedKey,
        defaultModel: cachedModel,
      };
    });
  }, []);

  const updateApiEndpoint = useCallback(
    (endpoint: string) => {
      setSettings((prev) => ({ ...prev, api: endpoint }));
    },
    []
  );

  const updateApiKey = useCallback(
    (key: string) => {
      setSettings((prev) => {
        const currentProviderId = prev.providerId || 'custom';
        const newCache = { ...prev.providerApiKeyCache, [currentProviderId]: key };
        
        return {
          ...prev,
          key,
          providerApiKeyCache: newCache,
        };
      });
    },
    []
  );

  const updateDefaultModel = useCallback(
    (model: string) => {
      setSettings((prev) => {
        const currentProviderId = prev.providerId || 'custom';
        const updatedCache = {
          ...prev.providerDefaultModelCache,
          [currentProviderId]: model,
        };

        return {
          ...prev,
          defaultModel: model,
          providerDefaultModelCache: updatedCache,
        };
      });
    },
    []
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

  const sanitizeTool = (tool: ContextMenuItem): ContextMenuItem =>
    tool.enabled === false ? { ...tool, defaultFor: undefined } : tool;

  const addTool = useCallback(
    async (tool: ContextMenuItem) => {
      try {
        setIsSaving(true);
        setError(null);
        
        // Enforce exclusivity before adding
        const sanitizedTool = sanitizeTool(tool);
        let currentItems = settingsRef.current.items;
        if (sanitizedTool.defaultFor) {
          currentItems = enforceDefaultExclusivity(currentItems, sanitizedTool);
        }

        const newSettings = { ...settingsRef.current, items: [...currentItems, sanitizedTool] };
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
      items: prev.items.map((item, i) => {
        if (i !== index) return item;
        const merged = { ...item, ...updatedTool } as ContextMenuItem;
        return merged.enabled === false ? { ...merged, defaultFor: undefined } : merged;
      }),
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
        const sanitizedTool = sanitizeTool(updatedTool);
        if (sanitizedTool.defaultFor) {
          items = enforceDefaultExclusivity(items, sanitizedTool, index);
        }
        
        items[index] = sanitizedTool;
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
        if (tool.enabled === false) return;
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

  const toggleToolEnabled = useCallback(
    async (index: number, enabled: boolean) => {
      try {
        setIsSaving(true);
        setError(null);

        const items = [...settingsRef.current.items];
        if (index < 0 || index >= items.length) return;

        const tool = items[index];
        const updatedTool = {
          ...tool,
          enabled,
          defaultFor: enabled ? tool.defaultFor : undefined,
        };

        items[index] = updatedTool;
        const newSettings = { ...settingsRef.current, items };

        await updateContextMenuSettings(newSettings);
        setSettings(newSettings);
      } catch (err) {
        setError('Failed to toggle tool');
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
    updateDefaultModel,
    updateProvider,
    addTool,
    removeTool,
    updateTool,
    reorderTools,
    saveTool,
    saveSettings,
    toggleDefaultTool,
    toggleToolEnabled,
  };
};

/**
 * Type for the hook return value
 */
export type ContextMenuSettingsHook = ReturnType<typeof useContextMenuSettings>;
