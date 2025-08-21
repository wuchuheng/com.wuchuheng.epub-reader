import React from 'react';
import { BookNavigationResult } from '../../../types/epub';
import { ProgressBar } from './ProgressBar';
import { NavigationControls } from './NavigationControls';
import { ActionButtons } from './ActionButtons';

/**
 * Navigation bar component with controls
 * Orchestrates smaller components for page navigation, progress display, and settings
 */
interface NavigationBarProps {
  navigation: BookNavigationResult;
  onSettingsToggle: () => void;
  onTocToggle: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  navigation,
  onSettingsToggle,
  onTocToggle,
}) => (
  <div className="bg-white border-b shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Left controls */}
        <ActionButtons onTocToggle={onTocToggle} onSettingsToggle={onSettingsToggle} />

        {/* Center - Progress bar */}
        <ProgressBar
          currentPage={navigation.currentPage}
          totalPages={navigation.totalPages}
          currentChapter={navigation.currentChapter}
        />

        {/* Right controls */}
        <NavigationControls
          onPrevPage={navigation.goToPrevPage}
          onNextPage={navigation.goToNextPage}
          isAtStart={navigation.isAtStart}
          isAtEnd={navigation.isAtEnd}
        />
      </div>
    </div>
  </div>
);
