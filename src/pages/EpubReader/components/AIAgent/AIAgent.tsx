import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UserMessageRender } from './components/UserMessage';
import { replaceWords } from './utils';
import { AIMessageRender, AIMessageRenderProps } from './components/AIMessageRender';
import { InputBarRender, InputBarRenderProps } from './components/InputBarRender';
import { AIAgentProps, MessageItem } from './types/AIAgent';
import { useFetchAIMessage } from './hooks/useFetchAIMessage';
import { useSmoothScrollToBottom } from './hooks/useSmoothScroll';
import { useAutoScrollOnUpdate } from './hooks/useAutoScrollOnUpdate';
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

  const conversationRef = useRef<HTMLDivElement>(null);
  const smoothScrollToBottom = useSmoothScrollToBottom(conversationRef, 600);

  // Auto-scroll when messages update if user is already near the bottom.
  useAutoScrollOnUpdate(conversationRef, messageList, smoothScrollToBottom, 120);

  // Cleanup handled by useSmoothScrollToBottom

  const onUpdateAIResponse = useCallback(
    (res: AIMessageRenderProps) => {
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

      // 2.2 Scroll the conversation to bottom with smooth easing
      smoothScrollToBottom();
    },
    [smoothScrollToBottom]
  );
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

  return (
    <div className="relative flex h-full flex-col overflow-y-scroll" ref={conversationRef}>
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
      <ScrollGuard />

      <InputBarRender
        status={inputBarStatus}
        onStop={() => setInputBarStatus('idle')}
        onSend={onSend}
      />
    </div>
  );
};
