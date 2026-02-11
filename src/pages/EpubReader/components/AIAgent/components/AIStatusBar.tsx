import { FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa6';
import { AIActions } from './AIActions';

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

    <div className="ml-auto">
      <AIActions
        onChat={props.onChatClick}
        onCopy={props.onCopy}
        onRefresh={props.onRefresh}
        isCopied={props.copied}
      />
    </div>
  </div>
);
