import React, { useEffect, useRef } from 'react';
import { AIAgentProps } from './types/AIAgent';
import { useSmoothScrollToBottom } from './hooks/useSmoothScroll';
import { MessageList, ViewMode } from './components/MessageList/MessageList';
import { SelectInfo } from '@/types/epub';

/**
 * AI Agent component that provides a chat interface for AI interactions.
 * Supports streaming responses and conversation history.
 */
export type AIAgentComponentProps = AIAgentProps & {
  onDrilldownSelect?: (selection: SelectInfo) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
};

export const AIAgent: React.FC<AIAgentComponentProps> = (props) => {
  const scrollContainerRef: React.RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const isAutoScrollRef = useRef(true);
  const isGoToBottomRef = useRef<boolean>(true);
  const viewMode = props.viewMode ?? 'simple';

  const {
    scrollToBottom,
    handleOnPauseAutoScroll,
    handleResumeAutoScroll,
    bufferPx,
    handleWheelEvent,
  } = useSmoothScrollToBottom({
    isAutoScrollRef,
    isGoToBottomRef,
    scrollContainerRef,
  });

  // Reset scroll position or scroll to bottom when viewMode changes.
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    if (viewMode === 'simple') {
        scrollContainerRef.current.scrollTop = 0;
    } else if (viewMode === 'conversation') {
        // When entering conversation mode, scroll to bottom to show latest messages
        // Use a small timeout to ensure layout has updated (especially if switching from hidden)
        setTimeout(() => {
            scrollToBottom();
            isGoToBottomRef.current = true;
        }, 0);
    }
  }, [scrollContainerRef, viewMode, scrollToBottom]);

  // Listen to  the message list change to trigger the scroll when in auto scroll mode.
  const forwardViewModeChange = (mode: ViewMode) => {
    props.onViewModeChange?.(mode);
  };

  return (
    <div
      className={`relative flex h-full flex-col ${props.viewMode === 'simple' ? '' : 'overflow-y-scroll'}`}
      // In simple mode (stacked), the scrolling is handled by the parent (ContextMenu), 
      // so we should probably disable overflow-y-scroll here or make it auto.
      // Actually, if ContextMenu is managing the scroll, AIAgent shouldn't be a scroll container in simple mode.
      ref={scrollContainerRef}
      onTouchStart={handleOnPauseAutoScroll}
      onMouseDown={handleOnPauseAutoScroll}
      onTouchEnd={handleResumeAutoScroll}
      onMouseUp={handleResumeAutoScroll}
      onWheel={handleWheelEvent}
      onScroll={(e) => {
        const isGoToBottom =
          e.currentTarget.scrollTop + e.currentTarget.clientHeight >=
          e.currentTarget.scrollHeight - bufferPx;
        isGoToBottomRef.current = isGoToBottom;
        console.log('onScroll - isGoToBottom:', isGoToBottom);
      }}
    >
      <MessageList
        onChangeMessageList={forwardViewModeChange}
        inputBarVisit={() => {
          if (isGoToBottomRef.current) {
            scrollToBottom();
          }
        }}
        onDrilldownSelect={props.onDrilldownSelect}
        {...props}
        viewMode={viewMode} // Pass viewMode to MessageList
      />
      {viewMode === 'conversation' && (
        <div className="w-full text-center text-sm text-gray-400">-- You've reached the end! --</div>
      )}
    </div>
  );
};
