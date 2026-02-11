import React from 'react';
import { ChatBubble, Copy, CheckCircle } from '@/components/icons';
import { LuRefreshCcw } from 'react-icons/lu';

export type AIActionsProps = {
  onChat?: () => void;
  onCopy?: () => void;
  onRefresh?: () => void;
  isCopied?: boolean;
  className?: string;
  iconClassName?: string;
  buttonClassName?: string;
};

export const AIActions: React.FC<AIActionsProps> = ({
  onChat,
  onCopy,
  onRefresh,
  isCopied,
  className = 'flex items-center gap-2',
  iconClassName = 'h-4 w-4',
  buttonClassName = 'rounded p-1 transition-colors hover:bg-gray-200 text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed',
}) => {
  return (
    <div className={className}>
      {onChat && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChat();
          }}
          className={buttonClassName}
          aria-label="Open conversation"
          title="Open conversation"
        >
          <ChatBubble className={iconClassName} />
        </button>
      )}
      {onCopy && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopy();
          }}
          className={buttonClassName}
          aria-label="Copy response"
          title={isCopied ? 'Copied!' : 'Copy response'}
        >
          {isCopied ? (
            <CheckCircle className={`${iconClassName} text-green-500`} />
          ) : (
            <Copy className={iconClassName} />
          )}
        </button>
      )}
      {onRefresh && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
          className={buttonClassName}
          aria-label="Regenerate response"
          title="Regenerate response"
        >
          <LuRefreshCcw className={iconClassName} />
        </button>
      )}
    </div>
  );
};
