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
  refreshId?: number;
  onScrollTargetMount?: (el: HTMLElement | null) => void;
};

export const AIAgent: React.FC<AIAgentComponentProps> = (props) => {
  const scrollContainerRef: React.RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const isAutoScrollRef = useRef(true);
  const isGoToBottomRef = useRef<boolean>(true);
  const viewMode = props.viewMode ?? 'simple';
  const { onViewModeChange, onScrollTargetMount } = props;

  // --- State & Logic moved from MessageList ---
  const content = replaceWords({
    template: props.prompt,
    words: props.words,
    context: props.context,
  });

  const [messageList, setMessageList] = useState<MessageItem[]>([]);
  const initialContentRef = useRef<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const onUpdateAIResponse = useCallback((res: AIMessageRenderProps) => {
    setMessageList((prev) => {
      if (prev.length === 0) return prev;
      const latest = prev[prev.length - 1];
      if (latest.role !== 'assistant') {
        return prev;
      }
      const updatedMessages = [...prev];
      updatedMessages[updatedMessages.length - 1] = {
        ...latest,
        data: { ...latest.data, ...res },
      };

      return updatedMessages;
    });
  }, []);

  const fetchAIMessage = useFetchAIMessage({
    setMessageList,
    apiKey: props.apiKey,
    api: props.api,
    model: props.model,
    onUpdateAIResponse,
    reasoningEnabled: props.reasoningEnabled,
    abortControllerRef,
    contextId: props.contextId,
    toolName: props.toolName,
    maxConcurrentRequests: props.maxConcurrentRequests,
  });

  const onSend = useCallback(
    (msg: string) => {
      const userMessage: MessageItem = { role: 'user', content: msg };
      const nextMessages = [...messageList, userMessage];
      setMessageList(nextMessages);
      fetchAIMessage(nextMessages);
    },
    [fetchAIMessage, messageList]
  );

  useEffect(() => {
    if (initialContentRef.current === content) {
      return;
    }

    const initialMessage: MessageItem = { role: 'user', content };
    initialContentRef.current = content;
    setMessageList([initialMessage]);
    fetchAIMessage([initialMessage]);
  }, [content, fetchAIMessage]);

  // Handle refresh
  const lastRefreshIdRef = useRef(props.refreshId);
  useEffect(() => {
    if (props.refreshId !== undefined && props.refreshId !== lastRefreshIdRef.current) {
      lastRefreshIdRef.current = props.refreshId;

      // Only refresh if we have messages
      if (messageList.length === 0) return;

      let newMessageList = [...messageList];
      const lastMessage = newMessageList[newMessageList.length - 1];

      // If last message is from assistant, remove it to regenerate
      if (lastMessage.role === 'assistant') {
        newMessageList = newMessageList.slice(0, -1);
        setMessageList(newMessageList);
      }

      // Trigger fetch with ignoreCache
      fetchAIMessage(newMessageList, { ignoreCache: true });
    }
  }, [props.refreshId, messageList, fetchAIMessage]);

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

  // Update scroll target when mounted/changed
  useEffect(() => {
    if (viewMode === 'conversation' && scrollContainerRef.current) {
      onScrollTargetMount?.(scrollContainerRef.current);
    } else {
      onScrollTargetMount?.(null);
    }

    return () => {
      onScrollTargetMount?.(null);
    };
  }, [viewMode, onScrollTargetMount]);

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
