import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UserMessageRender } from './components/UserMessage';
import { replaceWords } from './utils';
import { AIMessageRender, AIMessageRenderProps } from './components/AIMessageRender';
import { InputBarRender, InputBarRenderProps } from './components/InputBarRender';
import { AIAgentProps, MessageItem } from './types/AIAgent';
import { useFetchAIMessage } from './hooks/useFetchAIMessage';
import { useSmoothScrollToBottom } from './hooks/useSmoothScroll';
import { ScrollGuard } from './components/ScrollGuard';

/**
 * AI Agent component that provides a chat interface for AI interactions.
 * Supports streaming responses and conversation history.
 */
export const AIAgent: React.FC<AIAgentProps> = (props) => {
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

  const scrollContainerRef: React.RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const isAutoScrollRef = useRef(true);
  const isGoToBottomRef = useRef<boolean>(true);
  const { scrollToBottom, handleOnPauseAutoScroll, handleResumeAutoScroll, bufferPx } =
    useSmoothScrollToBottom({
      isAutoScrollRef,
      isGoToBottomRef,
      scrollContainerRef,
    });

  // Cleanup handled by useSmoothScrollToBottom
  const onUpdateAIResponse = useCallback((res: AIMessageRenderProps) => {
    // 2. Handle logic.
    // 2.1 Update the latest message, that must be AI type message.
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
  });

  const hasFetchedInitiallyRef = useRef(false);
  useEffect(() => {
    if (hasFetchedInitiallyRef.current) return;
    hasFetchedInitiallyRef.current = true;
    fetchAIMessage(messageList);
  }, [fetchAIMessage, messageList]);
  const [inputBarStatus, setInputBarStatus] = useState<InputBarRenderProps['status']>('idle');

  const onSend = useCallback(
    (msg: string) => {
      const msgList: MessageItem[] = [...messageList, { role: 'user', content: msg }];
      fetchAIMessage(msgList);
    },
    [messageList, fetchAIMessage]
  );

  // Make the scrollbar go to the bottom as the component set tup.
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const scrollTop =
      scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
    scrollContainerRef.current.scrollTop = scrollTop;
    console.log('Initial scrollTop:', scrollTop);
  }, [scrollContainerRef]);

  // Listen to  the message list change to trigger the scroll when in auto scroll mode.
  useEffect(() => {
    // 2.2 Scroll the conversation to bottom with smooth easing
    if (isAutoScrollRef.current && isGoToBottomRef.current) {
      scrollToBottom();
    }
  }, [messageList]);

  return (
    <div
      className="relative flex h-full flex-col overflow-y-scroll"
      ref={scrollContainerRef}
      onTouchStart={handleOnPauseAutoScroll}
      onMouseDown={handleOnPauseAutoScroll}
      onTouchEnd={handleResumeAutoScroll}
      onMouseUp={handleResumeAutoScroll}
    >
      <div className="flex flex-1 flex-col gap-2 divide-y divide-gray-300 p-4">
        {messageList.map((msg, index) => {
          if (msg.role === 'user') {
            return (
              <UserMessageRender
                key={index}
                content={msg.content}
                hightWords={msg.highlightWords}
              />
            );
          }
          return <AIMessageRender key={index} {...msg.data} />;
        })}
      </div>
      <ScrollGuard
        bufferPx={bufferPx}
        scrollContainer={scrollContainerRef.current}
        onGuardVisible={(visible) => {
          isGoToBottomRef.current = visible;
          console.log('Guard visible:', visible);
        }}
      />

      <InputBarRender
        status={inputBarStatus}
        onStop={() => {
          setInputBarStatus('idle');
        }}
        onVisible={() => {
          if (isGoToBottomRef.current) {
            scrollToBottom();
          }
        }}
        onSend={onSend}
      />
    </div>
  );
};
