import { useState, useRef, useCallback, useEffect } from 'react';
import { ContextMenu, SelectInfo } from '../../../types/epub';
import { ContextMenuItem } from '../../../types/epub';
import {
  getOrCreateContextId,
  getContextMetadata,
} from '../../../services/ContextMenuCacheService';
import { logger } from '../../../utils/logger';
import { useNavigate } from 'react-router-dom';
import { getWordCount } from '../utils/domUtils';
import { DEFAULT_CONFIG } from '../../../constants/epub';

export type ContextMenuEntry = ContextMenu & {
  id: number;
  parentId: number | null;
  selectionId: number;
};

interface UseContextMenuStateProps {
  activeTools: ContextMenuItem[];
  maxSelectedWords?: number;
  onShowMessage?: (msg: string) => void;
}

export const useContextMenuState = ({ activeTools, maxSelectedWords, onShowMessage }: UseContextMenuStateProps) => {
  const [menuStack, setMenuStack] = useState<ContextMenuEntry[]>([]);
  const isMenuOpenRef = useRef(false);
  useEffect(() => {
    isMenuOpenRef.current = menuStack.length > 0;
  }, [menuStack]);
  const selectionCounterRef = useRef(0);
  const menuIdRef = useRef(0);
  const navigate = useNavigate();

  const getSupportedTools = useCallback(
    (words: string): ContextMenuItem[] => {
      const trimmedWords = words.trim();
      const wordCount = trimmedWords.split(/\s+/).filter(Boolean).length;
      const isSingleWord = wordCount === 1;

      return activeTools.filter((tool) => {
        if (isSingleWord) {
          return tool.supportsSingleWord !== false;
        }
        return tool.supportsMultiWord !== false;
      });
    },
    [activeTools]
  );

  const createMenuEntry = useCallback(
    (info: SelectInfo, parentId: number | null = null): ContextMenuEntry | null => {
      const trimmedWords = info.words.trim();
      if (trimmedWords === '') {
        return null;
      }

      const supportedTools = getSupportedTools(trimmedWords);
      if (supportedTools.length === 0) {
        return null;
      }

      selectionCounterRef.current += 1;
      menuIdRef.current += 1;

      return {
        id: menuIdRef.current,
        parentId,
        selectionId: selectionCounterRef.current,
        tabIndex: 0,
        ...info,
      };
    },
    [getSupportedTools]
  );

  const pushBaseMenu = useCallback(
    async (info: SelectInfo) => {
      logger.log('[EpubReader] pushBaseMenu called', {
        words: info.words,
        contextLength: info.context.length,
      });

      const limit = maxSelectedWords ?? DEFAULT_CONFIG.DEFAULT_MAX_SELECTED_WORDS;
      const count = getWordCount(info.words);

      if (count > limit) {
        onShowMessage?.('Selection exceeds the max word limit. Reduce your selection to continue.');
        return;
      }

      const supportedTools = getSupportedTools(info.words);

      if (supportedTools.length === 0) {
        logger.warn('[EpubReader] No supported tools for selection');
        if (activeTools.length === 0) {
          alert('No enabled tools available. Enable one in Settings > Context Menu.');
        } else {
          alert(
            'No tools support this selection length. Enable single or multi-word support in Settings.'
          );
        }
        setMenuStack([]);
        return;
      }

      let contextId: number;

      try {
        logger.log('[EpubReader] Calling getOrCreateContextId...');
        contextId = await getOrCreateContextId(info.words, info.context);
        logger.log(`[EpubReader] ✅ Got context ID: ${contextId}`);
      } catch (error) {
        logger.error('[EpubReader] ❌ Failed to get context ID:', error);
        menuIdRef.current += 1;
        contextId = menuIdRef.current;
        logger.log(`[EpubReader] Using fallback ID: ${contextId}`);
      }

      selectionCounterRef.current += 1;

      const entry: ContextMenuEntry = {
        id: contextId,
        parentId: null,
        selectionId: selectionCounterRef.current,
        tabIndex: 0,
        words: info.words,
        context: info.context,
      };

      logger.log('[EpubReader] Menu entry created:', {
        id: entry.id,
        selectionId: entry.selectionId,
      });

      setMenuStack([entry]);
      logger.log('[EpubReader] ✅ MenuStack updated with new entry');
    },
    [activeTools.length, getSupportedTools, maxSelectedWords, onShowMessage]
  );

  const pushDrilldownMenu = useCallback(
    (parentId: number, info: SelectInfo) => {
      const limit = maxSelectedWords ?? DEFAULT_CONFIG.DEFAULT_MAX_SELECTED_WORDS;
      const count = getWordCount(info.words);

      if (count > limit) {
        onShowMessage?.('Selection exceeds the max word limit. Reduce your selection to continue.');
        return;
      }

      const supportedTools = getSupportedTools(info.words);
      if (supportedTools.length === 0) {
        if (activeTools.length === 0) {
          alert('No enabled tools available. Enable one in Settings > Context Menu.');
          setMenuStack([]);
        } else {
          alert(
            'No tools support this selection length. Enable single or multi-word support in Settings.'
          );
        }
        return;
      }

      const entry = createMenuEntry(info, parentId);
      if (!entry) return;

      setMenuStack((prev) => [...prev, entry]);
    },
    [activeTools.length, createMenuEntry, getSupportedTools, maxSelectedWords, onShowMessage]
  );

  const removeMenuAndChildren = useCallback(
    (id: number) => {
      setMenuStack((prev) => {
        const idsToRemove = new Set<number>();
        const collect = (targetId: number) => {
          idsToRemove.add(targetId);
          prev.forEach((entry) => {
            if (entry.parentId === targetId) {
              collect(entry.id);
            }
          });
        };

        collect(id);
        const newStack = prev.filter((entry) => !idsToRemove.has(entry.id));

        const isRemovingTopMost = prev.length > 0 && prev[prev.length - 1].id === id;
        if (isRemovingTopMost && prev.length > newStack.length) {
          navigate(-1);
          return prev;
        }

        return newStack;
      });
    },
    [navigate]
  );

  const updateTabIndex = useCallback((id: number, tabIndex: number) => {
    setMenuStack((prev) => prev.map((entry) => (entry.id === id ? { ...entry, tabIndex } : entry)));
  }, []);

  const restoreFromMetadata = useCallback(async (ids: number[]) => {
    const entries: ContextMenuEntry[] = [];

    for (const id of ids) {
      logger.log(`[EpubReader] Fetching metadata for context ID ${id}...`);
      const metadata = await getContextMetadata(id);

      if (!metadata) {
        logger.error(`[EpubReader] ❌ Context metadata not found for ID ${id}`);
        continue;
      }

      logger.log(`[EpubReader] ✅ Metadata found for ID ${id}:`, {
        words: metadata.words.slice(0, 30),
      });

      selectionCounterRef.current += 1;

      entries.push({
        id,
        parentId: null,
        selectionId: selectionCounterRef.current,
        tabIndex: 0,
        words: metadata.words,
        context: metadata.context,
      });
    }
    return entries;
  }, []);

  return {
    menuStack,
    setMenuStack,
    pushBaseMenu,
    pushDrilldownMenu,
    removeMenuAndChildren,
    updateTabIndex,
    getSupportedTools,
    restoreFromMetadata,
    selectionCounterRef,
    isMenuOpenRef,
  };
};
