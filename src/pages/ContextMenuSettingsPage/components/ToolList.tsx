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
import { AISettingItem, ContextMenuItem, IframeSettingItem } from '../../../types/epub';
import { ToolForm } from './ToolForm';
import { DragHandle } from '../../../components/icons';

/**
 * Props for tool list component.
 */
interface ToolListProps {
  /** Array of tools to display. */
  tools: ContextMenuItem[];
  /** Handler for updating a tool at specific index. */
  onToolUpdate: (index: number, updatedTool: AISettingItem | IframeSettingItem) => void;
  /** Handler for removing a tool at specific index. */
  onToolRemove: (index: number) => void;
  /** Handler for reordering tools. */
  onToolReorder: (fromIndex: number, toIndex: number) => void;
  /** API endpoint for fetching models. */
  apiEndpoint?: string;
  /** API key for authentication. */
  apiKey?: string;
}

/**
 * Sortable tool item component with drag handle.
 */
interface SortableToolItemProps {
  tool: ContextMenuItem;
  index: number;
  onToolUpdate: (index: number, updatedTool: AISettingItem | IframeSettingItem) => void;
  onToolRemove: (index: number) => void;
  apiEndpoint?: string;
  apiKey?: string;
}

const SortableToolItem: React.FC<SortableToolItemProps> = ({
  tool,
  index,
  onToolUpdate,
  onToolRemove,
  apiEndpoint,
  apiKey,
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
      className={`rounded-md border border-gray-200 p-4 transition-all duration-200 ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div>
            <h4 className="font-medium text-gray-900">{tool.name}</h4>
            <p className="text-sm text-gray-500">{tool.shortName}</p>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              {tool.type === 'AI' ? 'AI Tool' : 'Iframe Tool'}
            </span>
          </div>
        </div>

        {/* Right side: Action buttons */}
        <div className="flex items-center space-x-2">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-move touch-none p-1 text-gray-400 hover:text-gray-600"
          >
            <DragHandle />
          </div>

          {/* Remove button */}
          <button
            onClick={() => onToolRemove(index)}
            className="text-red-500 transition-colors hover:text-red-700"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {tool.type === 'AI' ? (
          <ToolForm
            tool={tool as AISettingItem}
            onChange={(updatedTool) => onToolUpdate(index, updatedTool)}
            apiEndpoint={apiEndpoint}
            apiKey={apiKey}
          />
        ) : (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-gray-700">URL</label>
              <input
                type="url"
                value={(tool as IframeSettingItem).url}
                onChange={(e) => onToolUpdate(index, { ...tool, url: e.target.value })}
                placeholder="https://example.com?words={words}&context={context}"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
              <div className="mt-2 text-sm">
                <div className="mb-1 font-medium text-gray-700">Tips:</div>

                <ul className="list-inside list-disc space-y-1 text-xs text-gray-500">
                  <li>
                    <span className="font-medium">{'{{words}}'}</span>: The currently selected text
                    in the ebook. Use this to pass the user's selection into the iframe URL or AI
                    prompt. Example:{' '}
                    <code className="font-mono">https://example.com?q={'{{words}}'}</code>
                  </li>

                  <li>
                    <span className="font-medium">{'{{context}}'}</span>: Additional surrounding
                    context (nearby paragraph, chapter title, or other metadata) to provide more
                    information to the tool. Use this when the tool needs surrounding text or
                    context. Example:{' '}
                    <code className="font-mono">https://example.com?ctx={'{{context}}'}</code>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
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
  onToolUpdate,
  onToolRemove,
  onToolReorder,
  apiEndpoint,
  apiKey,
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
              onToolUpdate={onToolUpdate}
              onToolRemove={onToolRemove}
              apiEndpoint={apiEndpoint}
              apiKey={apiKey}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
