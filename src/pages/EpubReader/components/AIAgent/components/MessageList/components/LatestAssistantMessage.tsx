import React from 'react';
import { AIMessageRender } from '../../AIMessageRender';
import { MessageItem } from '../../../types/AIAgent';
import { SelectInfo } from '@/types/epub';

type LatestAssistantMessageProps = {
  messageList: MessageItem[];
  fallbackModel: string;
  onDrilldownSelect?: (selection: SelectInfo) => void;
  onChatClick?: () => void;
  onRefresh?: () => void;
};

export const LatestAssistantMessage: React.FC<LatestAssistantMessageProps> = ({
  messageList,
  fallbackModel,
  onDrilldownSelect,
  onChatClick,
  onRefresh,
}) => {
  const latestAssistant = [...messageList].reverse().find((msg) => msg.role === 'assistant');

  if (!latestAssistant) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-sm text-gray-500">
        Awaiting AI response...
      </div>
    );
  }

  const hasContent =
    (latestAssistant.data.content && latestAssistant.data.content.trim().length > 0) ||
    (latestAssistant.data.reasoningContent &&
      latestAssistant.data.reasoningContent.trim().length > 0);

  if (!hasContent) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-sm text-gray-500">
        Awaiting AI response...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <AIMessageRender
        {...latestAssistant.data}
        model={latestAssistant.data.model || fallbackModel}
        hideRoleLabel
        onDrilldownSelect={onDrilldownSelect}
        onChatClick={onChatClick}
        onRefresh={onRefresh}
      />
    </div>
  );
};
