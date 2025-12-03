import { FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa6';
import { CheckCircle, Copy, ChatBubble } from '@/components/icons';
type AIStatusBarProps = {
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;

  onRefresh: () => void;
  onCopy: () => void;
  onChatClick?: () => void;
  copied: boolean;
};
export const AIStatusBar: React.FC<AIStatusBarProps> = (props) => (
  <div className="mt-4 flex flex-wrap items-center gap-1 text-xs text-gray-700 sm:gap-4 sm:text-sm">
    <span className="font-medium">Usage:</span>
    <div className="flex items-center gap-1">
      <FaArrowUp />
      <span>{props.usage.promptTokens}</span>
    </div>
    <div className="flex items-center gap-1">
      <FaArrowDown />
      <span>{props.usage.completionTokens}</span>
    </div>
    <div className="flex items-center gap-1">
      <FaChartLine />
      <span>{props.usage.totalTokens}</span>
    </div>
    <div className="flex items-center gap-1">
      LLM:
      <span>{props.model}</span>
    </div>

    <div className="ml-auto flex gap-2">
      {props.onChatClick && (
        <button
          onClick={props.onChatClick}
          className="rounded p-1 transition-colors hover:bg-gray-200"
          aria-label="Open conversation"
          title="Open conversation"
        >
          <ChatBubble className="h-4 w-4 text-gray-600" />
        </button>
      )}
      <button
        onClick={props.onCopy}
        className="rounded p-1 transition-colors hover:bg-gray-200"
        aria-label="Copy token usage"
        title={props.copied ? 'Copied!' : 'Copy token usage'}
      >
        {props.copied ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 text-gray-600" />
        )}
      </button>
    </div>
  </div>
);
