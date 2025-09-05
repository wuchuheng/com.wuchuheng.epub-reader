import React, { useEffect, useRef } from 'react';
import { AIAgentProps } from './types/AIAgent';
import { useSmoothScrollToBottom } from './hooks/useSmoothScroll';
import { MessageList } from './components/MessageList/MessageList';

/**
 * AI Agent component that provides a chat interface for AI interactions.
 * Supports streaming responses and conversation history.
 */
export const AIAgent: React.FC<AIAgentProps> = (props) => {
  const scrollContainerRef: React.RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const isAutoScrollRef = useRef(true);
  const isGoToBottomRef = useRef<boolean>(true);
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

  // Make the scrollbar go to the bottom as the component set tup.
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const scrollTop =
      scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
    scrollContainerRef.current.scrollTop = scrollTop;
    console.log('Initial scrollTop:', scrollTop);
  }, [scrollContainerRef]);

  // Listen to  the message list change to trigger the scroll when in auto scroll mode.
  const handleMessageListChange = () => {
    // 2. Scroll the conversation to bottom with smooth easing
    if (isAutoScrollRef.current && isGoToBottomRef.current) {
      scrollToBottom();
    }
  };

  return (
    <div
      className="relative flex h-full flex-col overflow-y-scroll"
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
        onChangeMessageList={handleMessageListChange}
        inputBarVisit={() => {
          if (isGoToBottomRef.current) {
            scrollToBottom();
          }
        }}
        {...props}
      />
      <div className="w-full text-center text-sm text-gray-400">-- You've reached the end! --</div>
    </div>
  );
};
