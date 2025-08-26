import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UserMessageRender } from './components/UserMessage';
import { replaceWords } from './utils';
import { AIMessageRender, AIMessageRenderProps } from './components/AIMessageRender';
import { InputBarRender, InputBarRenderProps } from './components/InputBarRender';
import { AIAgentProps, MessageItem } from './types/AIAgent';
import { useFetchAIMessage } from './hooks/useFetchAIMessage';

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
      highlightWords: props.words,
    },
  ]);

  const conversationRef = useRef<HTMLDivElement>(null);

  // Custom smooth scroll function with easing
  const smoothScrollToBottom = useCallback(() => {
    if (!conversationRef.current) return;

    const element = conversationRef.current;
    const start = element.scrollTop;
    const target = element.scrollHeight - element.clientHeight;
    const duration = 800; // Slightly longer for more fluid feel
    const startTime = performance.now();

    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      element.scrollTop = start + (target - start) * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }, []);

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

  useEffect(() => {
    fetchAIMessage(messageList);
  }, []);
  const [inputBarStatus, setInputBarStatus] = useState<InputBarRenderProps['status']>('idle');

  const onSend = useCallback(
    (msg: string) => {
      const msgList: MessageItem[] = [...messageList, { role: 'user', content: msg }];
      fetchAIMessage(msgList);
    },
    [messageList]
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
      <InputBarRender
        status={inputBarStatus}
        onStop={() => setInputBarStatus('idle')}
        onSend={onSend}
      />
    </div>
  );
};
