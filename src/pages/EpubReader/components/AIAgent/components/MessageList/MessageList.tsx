import React, { useCallback, useEffect, useRef, useState } from 'react';
import { replaceWords } from '../../utils';
import { AIAgentProps, MessageItem } from '../../types/AIAgent';
import { UserMessageRender } from '../UserMessage';
import { AIMessageRender, AIMessageRenderProps } from '../AIMessageRender';
import { useFetchAIMessage } from './useFetchAIMessage';
import { InputBarRender, InputBarRenderProps } from './components/InputBarRender';

type MessageListProps = {
  onChangeMessageList: () => void;
  inputBarVisit: () => void;
} & AIAgentProps;

export const MessageList: React.FC<MessageListProps> = ({ onChangeMessageList, ...props }) => {
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
    abortControllerRef,
  });

  const onSend = useCallback(
    (msg: string) => {
      const msgList: MessageItem[] = [...messageList, { role: 'user', content: msg }];
      fetchAIMessage(msgList);
    },
    [messageList, fetchAIMessage]
  );

  useEffect(() => {
    onChangeMessageList();
  }, [messageList, onChangeMessageList]);
  const [inputBarStatus, setInputBarStatus] = useState<InputBarRenderProps['status']>('idle');

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

  return (
    <>
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
        onStop={() => {
          setInputBarStatus('idle');
        }}
        onVisible={props.inputBarVisit}
        onSend={onSend}
      />
    </>
  );
};
