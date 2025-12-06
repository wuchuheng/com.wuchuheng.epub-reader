import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash } from '../icons';

interface BookActionsProps {
  /** Callback when read button is clicked */
  onRead: () => void;
  /** Callback when delete button is clicked */
  onDelete: (e: React.MouseEvent) => void;
  /** Optional custom className */
  className?: string;
  /** Whether the buttons should be disabled */
  disabled?: boolean;
  /** Whether only the read action should be disabled */
  disableRead?: boolean;
  /** Whether only the delete action should be disabled */
  disableDelete?: boolean;
}

/**
 * Component for book card action buttons (Read and Delete)
 * Uses proper icons and consistent styling
 */
export const BookActions: React.FC<BookActionsProps> = ({
  onRead,
  onDelete,
  className = '',
  disabled = false,
  disableRead = false,
  disableDelete = false,
}) => {
  const { t } = useTranslation();

  // 1. Input validation
  if (typeof onRead !== 'function' || typeof onDelete !== 'function') {
    console.error('BookActions: onRead and onDelete must be functions');
    return null;
  }

  // 2. Core processing - determine button states
  const readButtonClasses = `
    flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium 
    text-white transition-colors duration-200 hover:bg-blue-700 
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const deleteButtonClasses = `
    rounded px-3 py-2 text-sm text-red-600 transition-colors 
    duration-200 hover:bg-red-50 hover:text-red-800 
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // 3. Output handling - render action buttons
  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={onRead}
        disabled={disabled || disableRead}
        className={readButtonClasses.trim()}
        aria-label={t('common:read')}
      >
        {t('common:read')}
      </button>
      <button
        onClick={onDelete}
        disabled={disabled || disableDelete}
        className={deleteButtonClasses.trim()}
        aria-label={t('common:delete')}
        title={t('common:delete')}
      >
        <Trash />
      </button>
    </div>
  );
};
