import { useCallback, useState } from 'react';

/**
 * Hook for managing dialog state and operations.
 * Encapsulates dialog-specific logic and state management.
 */
export const useDialog = () => {
  // 1. State management
  const [isOpen, setIsOpen] = useState(false);

  // 2. Actions
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // 3. Export interface
  return {
    // State
    isOpen,
    
    // Actions
    open,
    close,
    toggle,
  };
};

/**
 * Type for the hook return value
 */
export type DialogHook = ReturnType<typeof useDialog>;