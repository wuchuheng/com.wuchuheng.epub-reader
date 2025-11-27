import React from 'react';
import { ContextMenuItem } from '../../../types/epub';

/**
 * Props for tool type selector component.
 */
interface ToolTypeSelectorProps {
  /** Current selected tool type. */
  selectedType: ContextMenuItem['type'];
  /** Handler for type selection changes. */
  onTypeChange: (type: ContextMenuItem['type']) => void;
}

/**
 * Component for selecting between AI and iframe tool types.
 * Encapsulates the type selection UI and logic.
 */
export const ToolTypeSelector: React.FC<ToolTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-gray-700">
      Tool Type
    </label>
    <div className="flex space-x-4">
      <button
        type="button"
        onClick={() => onTypeChange('AI')}
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          selectedType === 'AI'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        AI Tool
      </button>
      <button
        type="button"
        onClick={() => onTypeChange('iframe')}
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          selectedType === 'iframe'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Iframe Tool
      </button>
    </div>
  </div>
);