import { FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa6';
import { CheckCircle, Copy, Refresh } from '@/components/icons';
type AIStatusBarProps = {
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;

  onRefresh: () => void;
  onCopy: () => void;
  copied: boolean;
};
export const AIStatusBar: React.FC<AIStatusBarProps> = (props) => (
  <div className="mt-4 flex items-center gap-4 text-sm text-gray-700">
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
      <button
        onClick={props.onRefresh}
        className="rounded p-1 transition-colors hover:bg-gray-200"
        aria-label="Refresh token usage"
        title="Refresh token usage"
      >
        <Refresh className="h-4 w-4 text-gray-600" />
      </button>
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
