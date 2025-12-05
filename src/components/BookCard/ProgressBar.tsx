import React from 'react';
import { useTranslation } from 'react-i18next';

interface ProgressBarProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Optional custom className */
  className?: string;
  /** Whether to show percentage text */
  showPercentage?: boolean;
  /** Optional custom color for the progress bar */
  color?: string;
}

/**
 * Reusable progress bar component with consistent styling
 * Shows progress visually and optionally as percentage text
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showPercentage = true,
  color = 'bg-blue-600',
}) => {
  const { t } = useTranslation('common');
  // 1. Input validation
  if (typeof progress !== 'number' || progress < 0 || progress > 100) {
    console.warn('ProgressBar: progress must be a number between 0 and 100');
    return null;
  }

  // 2. Core processing - determine if progress should be shown
  const shouldShowProgress = progress > 0;

  // 3. Output handling - render progress bar
  if (!shouldShowProgress) {
    return null;
  }

  return (
    <div className={`mb-3 ${className}`}>
      {showPercentage && (
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>{t('progress')}</span>
          <span>{progress}%</span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-gray-200">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${t('progress')}: ${progress}%`}
        />
      </div>
    </div>
  );
};
