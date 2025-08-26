import React, { useEffect, useState } from 'react';
import { MarkdownRender } from './MarkdownRender';
import { MessageItemContainer } from './MessageItemContainer';
import { ChevronDown, ChevronRight, ArrowUp, CheckCircle, Copy, Refresh } from '@/components/icons';
import { logger } from '@/utils/logger';
import { AIStatusBar } from './AIStatusBar';

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
  // 1. State management for fold/unfold functionality
  const [isReasoningFolded, setIsReasoningFolded] = useState(false);
  const [userTogglerFolded, setUserTogglerFolded] = useState(false);

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
  useEffect(() => {
    const contentExisted = content.trim().length > 0;

    if (contentExisted && !isReasoningFolded && !userTogglerFolded) {
      logger.info('The reasoning content is being folded.');

      setIsReasoningFolded(true);
    }
  }, [content, userTogglerFolded, isReasoningFolded]);

  return (
    <>
      <MessageItemContainer roleName="Agent">
        {reasoningContent && (
          <div className="mb-4 rounded-r-md border-l-4 border-gray-400 bg-gray-50">
            {/* 2. Clickable header with toggle functionality */}
            <div
              className="flex cursor-pointer items-center justify-between p-4 transition-colors"
              onClick={(e) => {
                e.stopPropagation();

                setIsReasoningFolded(!isReasoningFolded);
                setUserTogglerFolded(true);
              }}
              aria-expanded={!isReasoningFolded}
              aria-controls="reasoning-content"
            >
              <div className="flex items-center">
                <span className="text-sm font-medium">💭 Thinking process</span>
              </div>
              {isReasoningFolded ? (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              )}
            </div>

            {/* 3. Conditionally rendered content */}
            {!isReasoningFolded && (
              <div id="reasoning-content" className="px-4 pb-4">
                <div className="text-sm text-gray-700">
                  <MarkdownRender content={reasoningContent} />
                </div>
              </div>
            )}
          </div>
        )}
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
