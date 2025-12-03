import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AIAgentProps, MessageItem } from './types/AIAgent';
import { useSmoothScrollToBottom } from './hooks/useSmoothScroll';
import { MessageList, ViewMode } from './components/MessageList/MessageList';
import { SelectInfo } from '@/types/epub';
import { InputBarRender } from './components/MessageList/components/InputBarRender';
import { replaceWords } from './utils';
import { AIMessageRenderProps } from './components/AIMessageRender';
import { useFetchAIMessage } from './components/MessageList/useFetchAIMessage';

/**
 * AI Agent component that provides a chat interface for AI interactions.
 * Supports streaming responses and conversation history.
 */
export type AIAgentComponentProps = AIAgentProps & {
  onDrilldownSelect?: (selection: SelectInfo) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  containerHeight?: number;
  chatPortalTarget?: HTMLElement | null;
};

export const AIAgent: React.FC<AIAgentComponentProps> = (props) => {
  const scrollContainerRef: React.RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const isAutoScrollRef = useRef(true);
  const isGoToBottomRef = useRef<boolean>(true);
  const viewMode = props.viewMode ?? 'simple';
  const { onViewModeChange } = props;

  // --- State & Logic moved from MessageList ---
  const content = replaceWords({
    template: props.prompt,
    words: props.words,
    context: props.context,
  });

  const [messageList, setMessageList] = useState<MessageItem[]>([
    {
      role: 'user',
      content,
    },
  ]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const onUpdateAIResponse = useCallback((res: AIMessageRenderProps) => {
    setMessageList((prev) => {
      const latest = prev[prev.length - 1];
      if (latest.role !== 'assistant') {
        throw new Error('Latest message is not AI type');
      }
      prev[prev.length - 1] = { ...latest, data: { ...latest.data, ...res } };

      return [...prev];
    });
  }, []);

  const fetchAIMessage = useFetchAIMessage({
    setMessageList,
    apiKey: props.apiKey,
    api: props.api,
    model: props.model,
    messageList,
    onUpdateAIResponse,
    reasoningEnabled: props.reasoningEnabled,
    abortControllerRef,
    contextId: props.contextId,
    toolName: props.toolName,
  });

  const onSend = useCallback(
    (msg: string) => {
      const msgList: MessageItem[] = [...messageList, { role: 'user', content: msg }];
      fetchAIMessage(msgList);
    },
    [messageList, fetchAIMessage]
  );

  const hasFetchedInitiallyRef = useRef(false);
  useEffect(() => {
    if (hasFetchedInitiallyRef.current) return;
    hasFetchedInitiallyRef.current = true;
    fetchAIMessage(messageList);
  }, [fetchAIMessage, messageList]);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    []
  );
  // --------------------------------------------

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
        scrollToBottom({ behavior: 'auto' });
        isGoToBottomRef.current = true;
      }, 0);
    }
  }, [scrollContainerRef, viewMode, scrollToBottom]);

  // Handle message updates for auto-scroll
  useEffect(() => {
    if (isAutoScrollRef.current && isGoToBottomRef.current && viewMode === 'conversation') {
      scrollToBottom();
    }
  }, [messageList, scrollToBottom, viewMode]);

  const handleInputBarVisible = useCallback(() => {
    if (isGoToBottomRef.current) {
      scrollToBottom();
    }
  }, [scrollToBottom]);

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      onViewModeChange?.(mode);
    },
    [onViewModeChange]
  );

  if (viewMode === 'simple') {
    return (
      <div className="h-auto">
        <MessageList
          messageList={messageList}
          viewMode="simple"
          onChatClick={() => handleViewModeChange('conversation')}
          fallbackModel={props.model}
          onDrilldownSelect={props.onDrilldownSelect}
          {...props}
        />
      </div>
    );
  }

  // Conversation Mode: Fixed Footer Layout
  const contentElement = (
    <div
      className="pointer-events-auto relative flex h-full flex-col bg-white"
      style={{ height: props.containerHeight ? `${props.containerHeight}px` : '100%' }}
    >
      <div
        className="flex-1 overflow-y-scroll"
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
        }}
      >
        <MessageList
          messageList={messageList}
          viewMode="conversation"
          onChatClick={() => {}}
          onDrilldownSelect={props.onDrilldownSelect}
          {...props}
        />
        <div className="w-full pb-4 text-center text-sm text-gray-400">
          -- You've reached the end! --
        </div>
      </div>

      <InputBarRender
        onVisible={handleInputBarVisible}
        onSend={onSend}
        mode={viewMode}
        onModeChange={handleViewModeChange}
      />
    </div>
  );

  if (viewMode === 'conversation' && props.chatPortalTarget) {
    return createPortal(contentElement, props.chatPortalTarget);
  }

  return contentElement;
};
