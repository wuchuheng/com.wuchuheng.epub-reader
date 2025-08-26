import { AISettingItem, ContextMenuSettings } from '@/types/epub';
import { ContextMenuProps } from '../../ContextMenu';
import { AIMessageRenderProps } from '../components/AIMessageRender';

/**
 * Props for the AIAgent component.
 */
export type AIAgentProps = Pick<AISettingItem, 'model' | 'prompt' | 'reasoningEnabled'> &
  Pick<ContextMenuProps, 'words' | 'context'> &
  Pick<ContextMenuSettings, 'api'> & {
    apiKey: string; // Renamed from 'key' to avoid React's reserved prop
  };

export type AIResponse = {
  content?: string;
  reasoning_content?: string;

  reasoningContent?: string;
};

type AIMessage = {
  role: 'assistant';
  data: AIMessageRenderProps;
};

type UserMessage = {
  role: 'user';
  content: string;
  highlightWords?: string;
};

export type MessageItem = UserMessage | AIMessage;
