import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { ContextMenuItem } from '../../../types/epub';
import { DragHandle, Edit, Trash } from '../../../components/icons';

/**
 * Props for tool list component.
 */
interface ToolListProps {
  /** Array of tools to display. */
  tools: ContextMenuItem[];
  /** Handler for removing a tool at specific index. */
  onToolRemove: (index: number) => void;
  /** Handler for reordering tools. */
  onToolReorder: (fromIndex: number, toIndex: number) => void;
  /** Handler for toggling enabled state. */
  onToggleEnabled: (index: number, enabled: boolean) => void;
  /** Handler for toggling selection support. */
  onToggleSupport: (index: number, support: 'single' | 'multi') => void;
}

/**
 * Sortable tool item component with drag handle.
 */
interface SortableToolItemProps {
  tool: ContextMenuItem;
  index: number;
  onToolRemove: (index: number) => void;
  onToggleEnabled: (index: number, enabled: boolean) => void;
  onToggleSupport: (index: number, support: 'single' | 'multi') => void;
}

const SortableToolItem: React.FC<SortableToolItemProps> = ({
  tool,
  index,
  onToolRemove,
  onToggleEnabled,
  onToggleSupport,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: index.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative overflow-hidden rounded-lg border border-gray-200 bg-white/90 px-4 py-3 shadow-sm
      transition-all duration-200 ${
        isDragging ? 'ring-2 ring-blue-200 shadow-lg' : 'hover:-translate-y-0.5 hover:shadow-md'
      }`}
    >
      <span className="absolute left-0 top-0 h-full w-1 bg-blue-200" aria-hidden />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h4 className="truncate text-base font-semibold text-gray-900">{tool.name}</h4>
            <span
              className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px]
              font-medium text-blue-800"
            >
              {tool.type === 'AI' ? 'AI' : 'Iframe'}
            </span>
          </div>

          {/* Selection Support */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <label className="flex cursor-pointer select-none items-center gap-1.5">
              <input
                type="checkbox"
                checked={tool.supportsSingleWord !== false}
                disabled={tool.enabled === false}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSupport(index, 'single');
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium">Single-word</span>
            </label>

            <label className="flex cursor-pointer select-none items-center gap-1.5">
              <input
                type="checkbox"
                checked={tool.supportsMultiWord !== false}
                disabled={tool.enabled === false}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSupport(index, 'multi');
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium">Multi-word</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            type="button"
            aria-pressed={tool.enabled !== false}
            aria-label={tool.enabled !== false ? 'Disable tool' : 'Enable tool'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleEnabled(index, !(tool.enabled !== false));
            }}
            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
              tool.enabled !== false ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                tool.enabled !== false ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
          <Link
            to={`/settings/contextmenu/${index}/edit`}
            aria-label="Edit tool"
            title="Edit tool"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200
            bg-white text-gray-600
            shadow-sm transition
            hover:border-blue-200 hover:text-blue-700"
          >
            <Edit />
          </Link>
          <button
            aria-label="Remove tool"
            title="Remove tool"
            onClick={() => onToolRemove(index)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition
            hover:bg-red-100"
          >
            <Trash />
          </button>
          <div
            {...attributes}
            {...listeners}
            className="cursor-move touch-none rounded-md p-1 text-gray-400 transition hover:bg-gray-100
            hover:text-gray-700"
            aria-label="Drag to reorder"
          >
            <DragHandle />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Reusable component for displaying and managing a list of tools.
 * Handles both AI and iframe tools with editing and removal functionality.
 */
export const ToolList: React.FC<ToolListProps> = ({
  tools,
  onToolRemove,
  onToolReorder,
  onToggleEnabled,
  onToggleSupport,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = parseInt(active.id.toString());
      const newIndex = parseInt(over?.id.toString() || oldIndex.toString());

      onToolReorder(oldIndex, newIndex);
    }
  }

  // 1. Input handling
  if (tools.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white/70
        px-6 py-8 text-center text-gray-600"
      >
        <div className="mb-2 text-lg font-semibold text-gray-800">No tools yet</div>
        <p className="text-sm text-gray-500">Add your first tool to show it in the reader menu.</p>
      </div>
    );
  }

  // 2. Core processing and rendering
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={tools.map((_, index) => index.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {tools.map((tool, index) => (
            <SortableToolItem
              key={index}
              tool={tool}
              index={index}
              onToolRemove={onToolRemove}
              onToggleEnabled={onToggleEnabled}
              onToggleSupport={onToggleSupport}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
