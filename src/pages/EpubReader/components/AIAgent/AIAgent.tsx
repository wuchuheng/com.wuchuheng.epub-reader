import React, { useEffect, useRef } from 'react';
import { AIAgentProps } from './types/AIAgent';
import { useSmoothScrollToBottom } from './hooks/useSmoothScroll';
import { ScrollGuard } from './components/ScrollGuard';
import { MessageList } from './components/MessageList/MessageList';

/**
 * AI Agent component that provides a chat interface for AI interactions.
 * Supports streaming responses and conversation history.
 */
export const AIAgent: React.FC<AIAgentProps> = (props) => {
  const scrollContainerRef: React.RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const isAutoScrollRef = useRef(true);
  const isGoToBottomRef = useRef<boolean>(true);
  const { scrollToBottom, handleOnPauseAutoScroll, handleResumeAutoScroll, bufferPx } =
    useSmoothScrollToBottom({
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
      <ScrollGuard
        bufferPx={bufferPx}
        scrollContainer={scrollContainerRef.current}
        onGuardVisible={(visible) => {
          isGoToBottomRef.current = visible;
          console.log('Guard visible:', visible);
        }}
      />
    </div>
  );
};
