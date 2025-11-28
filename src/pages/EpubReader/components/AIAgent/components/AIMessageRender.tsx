import React, { useRef, useState } from 'react';
import { MarkdownRender } from './MarkdownRender';
import { MessageItemContainer } from './MessageItemContainer';
import { logger } from '@/utils/logger';
import { AIStatusBar } from './AIStatusBar';
import { ThinkProgressing } from './ThinkingProgressing';
import { SelectInfo } from '@/types/epub';
import { resolveDrilldownSelection } from '../utils/drilldownSelection';

export type AIMessageRenderProps = {
  content: string;
  reasoningContent?: string;
  reasoningContentCompleted?: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  model: string;
  hideRoleLabel?: boolean;
};
export type AIMessageRenderComponentProps = AIMessageRenderProps & {
  onDrilldownSelect?: (selection: SelectInfo) => void;
  contextContainer?: HTMLElement | null;
};

export const AIMessageRender: React.FC<AIMessageRenderComponentProps> = ({
  content,
  reasoningContent,
  usage,
  model,
  hideRoleLabel = false,
  onDrilldownSelect,
  contextContainer,
}) => {
  // 1.1 State for copy feedback
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const handleContentClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!onDrilldownSelect) return;
    const container = contextContainer ?? contentRef.current;
    if (!container) return;

    const selection = resolveDrilldownSelection({
      event,
      container,
    });

    if (selection) {
      event.stopPropagation();
      onDrilldownSelect(selection);
    }
  };

  return (
    <>
      <MessageItemContainer
        roleName="Agent"
        hideRoleLabel={hideRoleLabel}
        onContentClick={handleContentClick}
        contentRef={contentRef}
      >
        <ThinkProgressing reasoningContent={reasoningContent} content={content} />
        <MarkdownRender content={content} />
        {usage && (
          <AIStatusBar
            usage={usage}
            onRefresh={handleRefresh}
            onCopy={handleCopyContent}
            copied={copied}
            model={model}
          />
        )}
      </MessageItemContainer>
    </>
  );
};
