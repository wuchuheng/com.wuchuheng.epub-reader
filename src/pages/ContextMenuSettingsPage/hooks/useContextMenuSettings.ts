import { useCallback, useState, useEffect, useRef } from 'react';
import { ContextMenuSettings, ContextMenuItem, AISettingItem } from '../../../types/epub';
import { getContextMenuSettings, updateContextMenuSettings } from '../../../services/OPFSManager';
import { AiProviderId, AI_PROVIDER_CATALOG } from '@/config/aiProviders';

const sanitizeSupports = (tool: ContextMenuItem): ContextMenuItem => {
  const supportsSingleWord = tool.supportsSingleWord !== false;
  const supportsMultiWord = tool.supportsMultiWord !== false;
  if (!supportsSingleWord && !supportsMultiWord) {
    return { ...tool, supportsSingleWord: true, supportsMultiWord: false };
  }
  return { ...tool, supportsSingleWord, supportsMultiWord };
};

const sanitizeTool = (tool: ContextMenuItem): ContextMenuItem => {
  const { defaultFor: _legacyDefault, ...rest } = tool as ContextMenuItem & {
    defaultFor?: unknown;
  };
  return sanitizeSupports(rest);
};

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
    pinnedMaximized: false,
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

        const sanitizedItems = (savedSettings?.items || []).map((item) => sanitizeTool(item));
        const pinnedMaximized = savedSettings.pinnedMaximized ?? false;
        const maxSelectedWords = savedSettings.maxSelectedWords ?? DEFAULT_CONFIG.DEFAULT_MAX_SELECTED_WORDS;

        // Ensure we have valid settings object
        const validSettings: ContextMenuSettings = {
          api,
          key: activeKey,
          defaultModel,
          pinnedMaximized,
          maxSelectedWords,
          items: sanitizedItems,
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
          pinnedMaximized: false,
          maxSelectedWords: DEFAULT_CONFIG.DEFAULT_MAX_SELECTED_WORDS,
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
  
  const updateMaxSelectedWords = useCallback(
    (limit: number) => {
      setSettings((prev) => ({ ...prev, maxSelectedWords: limit }));
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

  const updatePinnedMaximized = useCallback(async (isPinned: boolean) => {
    try {
      setIsSaving(true);
      setError(null);

      const newSettings: ContextMenuSettings = {
        ...settingsRef.current,
        pinnedMaximized: isPinned,
      };

      await updateContextMenuSettings(newSettings);
      setSettings(newSettings);
    } catch (err) {
      setError('Failed to update pin preference');
      console.error('Error updating pinnedMaximized:', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const addTool = useCallback(
    async (tool: ContextMenuItem) => {
      try {
        setIsSaving(true);
        setError(null);
        
        const sanitizedTool = sanitizeTool(tool);
        const newSettings = {
          ...settingsRef.current,
          items: [...settingsRef.current.items, sanitizedTool],
        };
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
        const merged = sanitizeTool({ ...item, ...updatedTool } as ContextMenuItem);
        return merged;
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

        const items = [...settingsRef.current.items];
        items[index] = sanitizeTool(updatedTool);
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

  const toggleToolEnabled = useCallback(
    async (index: number, enabled: boolean) => {
      try {
        setIsSaving(true);
        setError(null);

        const items = [...settingsRef.current.items];
        if (index < 0 || index >= items.length) return;

        const tool = items[index];
        const updatedTool = sanitizeTool({
          ...tool,
          enabled,
        });

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

  const toggleToolSupport = useCallback(
    async (index: number, supportType: 'single' | 'multi') => {
      try {
        setIsSaving(true);
        setError(null);

        const items = [...settingsRef.current.items];
        if (index < 0 || index >= items.length) return;

        const tool = items[index];
        if (tool.enabled === false) return;

        const nextValue =
          supportType === 'single'
            ? !(tool.supportsSingleWord !== false)
            : !(tool.supportsMultiWord !== false);

        let updatedTool: ContextMenuItem = {
          ...tool,
          supportsSingleWord:
            supportType === 'single' ? nextValue : tool.supportsSingleWord !== false,
          supportsMultiWord:
            supportType === 'multi' ? nextValue : tool.supportsMultiWord !== false,
        };

        updatedTool = sanitizeTool(updatedTool);

        items[index] = updatedTool;
        const newSettings = { ...settingsRef.current, items };

        await updateContextMenuSettings(newSettings);
        setSettings(newSettings);
      } catch (err) {
        setError('Failed to update tool support');
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
      const sanitizedSettings: ContextMenuSettings = {
        ...settings,
        items: settings.items.map((item) => sanitizeTool(item)),
      };
      await updateContextMenuSettings(sanitizedSettings);
      setSettings(sanitizedSettings);
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
    toggleToolEnabled,
    toggleToolSupport,
    updatePinnedMaximized,
    updateMaxSelectedWords,
  };
};

/**
 * Type for the hook return value
 */
export type ContextMenuSettingsHook = ReturnType<typeof useContextMenuSettings>;
