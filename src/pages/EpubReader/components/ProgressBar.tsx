import React from 'react';

/**
 * Progress bar component for displaying reading progress
 */
interface ProgressBarProps {
  currentPage: number;
  totalPages: number;
  currentChapter: string | null;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentPage,
  totalPages,
  currentChapter,
}) => {
  const progressPercentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return (
    <div className="flex-1 max-w-md mx-4">
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{progressPercentage}%</span>
          <span className="text-sm text-gray-500">{currentChapter || 'Chapter'}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
