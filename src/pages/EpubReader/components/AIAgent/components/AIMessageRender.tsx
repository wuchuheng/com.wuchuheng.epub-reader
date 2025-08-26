import React, { useEffect, useState } from 'react';
import { MarkdownRender } from './MarkdownRender';
import { MessageItemContainer } from './MessageItemContainer';
import { ChevronDown, ChevronRight } from '@/components/icons';
import { logger } from '@/utils/logger';
import { AIStatusBar } from './AIStatusBar';
import { ThinkProgressing } from './ThinkingProgressing';

export type AIMessageRenderProps = {
  content: string;
  reasoningContent?: string;
  reasoningContentCompleted?: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};
export const AIMessageRender: React.FC<AIMessageRenderProps> = ({
  content,
  reasoningContent,
  usage,
}) => {
  // 1.1 State for copy feedback
  const [copied, setCopied] = useState(false);

  // 1.2 Copy token usage data to clipboard
  const handleCopyContent = async () => {
    if (!usage) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      logger.info('Token usage copied to clipboard');
    } catch (error) {
      logger.error('Failed to copy token usage', { error });
    }
  };

  // 1.3 Handle refresh (placeholder - can be connected to parent component)
  const handleRefresh = () => {
    logger.info('Refresh token usage requested');
    // This can be connected to a parent callback if needed
  };

  return (
    <>
      <MessageItemContainer roleName="Agent">
        <ThinkProgressing reasoningContent={reasoningContent} content={content} />
        <MarkdownRender content={content} />
        {usage && (
          <AIStatusBar
            usage={usage}
            onRefresh={handleRefresh}
            onCopy={handleCopyContent}
            copied={copied}
          />
        )}
      </MessageItemContainer>
    </>
  );
};
