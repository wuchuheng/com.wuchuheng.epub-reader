import React, { useRef } from 'react';
import { AIAgentProps, MessageItem } from '../../types/AIAgent';
import { UserMessageRender } from '../UserMessage';
import { AIMessageRender } from '../AIMessageRender';
import { LatestAssistantMessage } from './components/LatestAssistantMessage';
import { SelectInfo } from '@/types/epub';

type MessageListProps = {
  messageList: MessageItem[];
  onDrilldownSelect?: (selection: SelectInfo) => void;
  viewMode?: ViewMode;
  onChatClick: () => void;
  onRefresh?: () => void;
  fallbackModel?: string;
} & AIAgentProps;

export type ViewMode = 'simple' | 'conversation';

export const MessageList: React.FC<MessageListProps> = ({
  messageList,
  onDrilldownSelect,
  viewMode,
  onChatClick,
  onRefresh,
  fallbackModel,
}) => {
  const conversationContainerRef = useRef<HTMLDivElement>(null);

  if (viewMode === 'conversation') {
    return (
      <div className="m-2 flex flex-col gap-2" ref={conversationContainerRef}>
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
              onRefresh={index === messageList.length - 1 ? onRefresh : undefined}
            />
          );
        })}
      </div>
    );
  }

  return (
    <LatestAssistantMessage
      messageList={messageList}
      fallbackModel={fallbackModel || ''}
      onDrilldownSelect={onDrilldownSelect}
      onChatClick={onChatClick}
      onRefresh={onRefresh}
    />
  );
};
