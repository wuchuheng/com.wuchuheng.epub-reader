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
import { DragHandle } from '../../../components/icons';

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
}

/**
 * Sortable tool item component with drag handle.
 */
interface SortableToolItemProps {
  tool: ContextMenuItem;
  index: number;
  onToolRemove: (index: number) => void;
}

const SortableToolItem: React.FC<SortableToolItemProps> = ({
  tool,
  index,
  onToolRemove,
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
      className={`rounded-md border border-gray-200 px-4 py-3 transition-all duration-200 ${
        isDragging ? 'opacity-50 shadow-lg' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-base font-medium text-gray-900">{tool.name}</h4>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
            {tool.type === 'AI' ? 'AI Tool' : 'Iframe Tool'}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            to={`/settings/contextmenu/${index}/edit`}
            className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Edit
          </Link>
          <button
            onClick={() => onToolRemove(index)}
            className="rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            Remove
          </button>
          <div
            {...attributes}
            {...listeners}
            className="cursor-move touch-none p-1 text-gray-400 hover:text-gray-600"
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
      <div className="py-8 text-center text-gray-500">
        No custom tools configured yet. Add your first tool below!
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
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
