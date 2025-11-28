import React, { useCallback, useEffect, useRef, useState } from 'react';
import { replaceWords } from '../../utils';
import { AIAgentProps, MessageItem } from '../../types/AIAgent';
import { UserMessageRender } from '../UserMessage';
import { AIMessageRender, AIMessageRenderProps } from '../AIMessageRender';
import { useFetchAIMessage } from './useFetchAIMessage';
import { InputBarRender } from './components/InputBarRender';
import { LatestAssistantMessage } from './components/LatestAssistantMessage';
import { SelectInfo } from '@/types/epub';

type MessageListProps = {
  onChangeMessageList: (mode: ViewMode) => void;
  inputBarVisit: () => void;
  onDrilldownSelect?: (selection: SelectInfo) => void;
} & AIAgentProps;

export type ViewMode = 'simple' | 'conversation';

export const MessageList: React.FC<MessageListProps> = ({
  onChangeMessageList,
  inputBarVisit,
  onDrilldownSelect,
  ...props
}) => {
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
  const [viewMode, setViewMode] = useState<ViewMode>('simple');
  const conversationContainerRef = useRef<HTMLDivElement>(null);

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
  });

  const onSend = useCallback(
    (msg: string) => {
      const msgList: MessageItem[] = [...messageList, { role: 'user', content: msg }];
      fetchAIMessage(msgList);
    },
    [messageList, fetchAIMessage]
  );

  useEffect(() => {
    onChangeMessageList(viewMode);
  }, [messageList, viewMode, onChangeMessageList]);
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

  const handleModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      if (mode === 'conversation') {
        inputBarVisit();
      }
    },
    [inputBarVisit]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        {viewMode === 'conversation' ? (
          <div
            className="flex flex-col gap-2 divide-y divide-gray-300 p-4"
            ref={conversationContainerRef}
          >
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
              return (
                <AIMessageRender
                  key={index}
                  {...msg.data}
                  onDrilldownSelect={onDrilldownSelect}
                  contextContainer={conversationContainerRef.current}
                />
              );
            })}
          </div>
        ) : (
          <LatestAssistantMessage
            messageList={messageList}
            fallbackModel={props.model}
            onDrilldownSelect={onDrilldownSelect}
          />
        )}
      </div>

      <InputBarRender
        onVisible={inputBarVisit}
        onSend={onSend}
        mode={viewMode}
        onModeChange={handleModeChange}
      />
    </div>
  );
};
