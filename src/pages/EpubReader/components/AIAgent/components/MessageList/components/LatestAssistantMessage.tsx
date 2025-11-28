import React from 'react';
import { AIMessageRender } from '../../AIMessageRender';
import { MessageItem } from '../../../types/AIAgent';

type LatestAssistantMessageProps = {
  messageList: MessageItem[];
  fallbackModel: string;
};

export const LatestAssistantMessage: React.FC<LatestAssistantMessageProps> = ({
  messageList,
  fallbackModel,
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
      />
    </div>
  );
};
