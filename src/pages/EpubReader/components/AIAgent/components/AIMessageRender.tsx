import React, { useRef } from 'react';
import { MarkdownRender } from './MarkdownRender';
import { MessageItemContainer } from './MessageItemContainer';
import { AIStatusBar } from './AIStatusBar';
import { ThinkProgressing } from './ThinkingProgressing';
import { SelectInfo } from '@/types/epub';
import { resolveDrilldownSelection } from '../utils/drilldownSelection';
import { useCopy } from '../hooks/useCopy';

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
  onChatClick?: () => void;
  onRefresh?: () => void;
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
  onChatClick,
  onRefresh,
}) => {
  // 1.1 State for copy feedback
  const { copied, copy } = useCopy();
  const contentRef = useRef<HTMLDivElement>(null);

  // 1.2 Copy token usage data to clipboard
  const handleCopyContent = async () => {
    copy(content);
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
            onRefresh={onRefresh || (() => {})}
            onCopy={handleCopyContent}
            onChatClick={onChatClick}
            copied={copied}
            model={model}
          />
        )}
      </MessageItemContainer>
    </>
  );
};
