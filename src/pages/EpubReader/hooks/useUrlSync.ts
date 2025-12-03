import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { logger } from '../../../utils/logger';
import { ContextMenuEntry } from './useContextMenuState';
import { initializeContextMenuCache } from '../../../services/ContextMenuCacheService';

interface UseUrlSyncProps {
  menuStack: ContextMenuEntry[];
  setMenuStack: (stack: ContextMenuEntry[]) => void;
  restoreFromMetadata: (ids: number[]) => Promise<ContextMenuEntry[]>;
}

export const useUrlSync = ({ menuStack, setMenuStack, restoreFromMetadata }: UseUrlSyncProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const hasInitializedCacheRef = useRef(false);
  const prevMenuStackRef = useRef<ContextMenuEntry[]>([]);

  const updateURLWithContextMenuIds = useCallback(
    (ids: number[], createHistoryEntry: boolean = false) => {
      const newParams = new URLSearchParams(searchParams);
      const currentParam = newParams.get('contextMenu');
      const newParam = ids.length > 0 ? ids.join(',') : null;

      if (currentParam === newParam) {
        return;
      }

      if (ids.length === 0) {
        newParams.delete('contextMenu');
      } else {
        newParams.set('contextMenu', ids.join(','));
      }

      if (createHistoryEntry) {
        navigate(
          {
            pathname: location.pathname,
            search: newParams.toString(),
          },
          { replace: false }
        );
      } else {
        setSearchParams(newParams, { replace: true });
      }
    },
    [searchParams, setSearchParams, navigate, location.pathname]
  );

  const rehydrateContextMenusFromURL = useCallback(async () => {
    const contextMenuParam = searchParams.get('contextMenu');
    logger.log('[EpubReader] rehydrateContextMenusFromURL called', { contextMenuParam });

    if (!contextMenuParam) {
      logger.log('[EpubReader] No contextMenu parameter in URL, skipping rehydration');
      if (menuStack.length > 0) {
        setMenuStack([]);
        prevMenuStackRef.current = [];
      }
      return;
    }

    const ids = contextMenuParam
      .split(',')
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id) && id > 0);

    if (ids.length === 0) {
      logger.log('[EpubReader] No valid context menu IDs in URL');
      setMenuStack([]);
      return;
    }

    logger.log(`[EpubReader] 🔄 Rehydrating ${ids.length} context menus from URL:`, ids);

    const entries = await restoreFromMetadata(ids);

    if (entries.length > 0) {
      logger.log(`[EpubReader] ✅ Rehydrated ${entries.length} context menus, updating menuStack`);
      setMenuStack(entries);
      prevMenuStackRef.current = entries;
    } else {
      logger.warn('[EpubReader] No entries rehydrated');
      setMenuStack([]);
      prevMenuStackRef.current = [];
    }
  }, [searchParams, menuStack.length, restoreFromMetadata, setMenuStack]);

  useEffect(() => {
    if (hasInitializedCacheRef.current) {
      return;
    }

    const initCache = async () => {
      try {
        await initializeContextMenuCache();
        logger.log('Context menu cache initialized');
        hasInitializedCacheRef.current = true;

        await rehydrateContextMenusFromURL();
      } catch (error) {
        logger.error('Failed to initialize cache:', error);
      }
    };

    initCache();
  }, [rehydrateContextMenusFromURL]);

  useEffect(() => {
    const currentIds = menuStack.map((entry) => entry.id);
    const urlParam = searchParams.get('contextMenu');
    const urlIds = urlParam
      ? urlParam
          .split(',')
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id))
      : [];

    const areIdsEqual =
      currentIds.length === urlIds.length && currentIds.every((id, index) => id === urlIds[index]);

    const prevIds = prevMenuStackRef.current.map((entry) => entry.id);
    const stackChanged =
      currentIds.length !== prevIds.length || !currentIds.every((id, i) => id === prevIds[i]);

    if (areIdsEqual) {
      if (stackChanged) {
        prevMenuStackRef.current = menuStack;
      }
      return;
    }

    if (!stackChanged && hasInitializedCacheRef.current) {
      return;
    }

    logger.log('[EpubReader] Syncing State to URL:', { currentIds, urlIds });

    prevMenuStackRef.current = menuStack;

    const isOpeningMenu = currentIds.length > urlIds.length;
    const shouldCreateHistoryEntry = isOpeningMenu && hasInitializedCacheRef.current;

    updateURLWithContextMenuIds(currentIds, shouldCreateHistoryEntry);
  }, [menuStack, searchParams, updateURLWithContextMenuIds]);

  useEffect(() => {
    const contextMenuParam = searchParams.get('contextMenu');
    const currentIds = menuStack.map((entry) => entry.id);
    const urlIds = contextMenuParam
      ? contextMenuParam
          .split(',')
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id))
      : [];

    const areIdsEqual =
      currentIds.length === urlIds.length && currentIds.every((id, index) => id === urlIds[index]);

    if (!areIdsEqual && hasInitializedCacheRef.current) {
      logger.log('[EpubReader] URL changed externally (back/forward), rehydrating...');
      rehydrateContextMenusFromURL();
    }
  }, [searchParams, menuStack, rehydrateContextMenusFromURL]);
};
