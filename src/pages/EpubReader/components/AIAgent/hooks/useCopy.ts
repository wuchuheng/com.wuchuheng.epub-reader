import { useState, useCallback } from 'react';
import { logger } from '@/utils/logger';

export const useCopy = () => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      logger.info('Content copied to clipboard');
    } catch (error) {
      logger.error('Failed to copy content', { error });
    }
  }, []);

  return { copied, copy };
};
