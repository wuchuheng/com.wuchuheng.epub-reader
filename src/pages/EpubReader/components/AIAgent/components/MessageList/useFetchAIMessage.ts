import OpenAI from 'openai';
import type { ChatCompletionCreateParamsStreaming } from 'openai/resources/chat/completions';
import { AIMessageRenderProps } from '../AIMessageRender';
import { AIResponse, MessageItem } from '../../types/AIAgent';
import { thinkingConfig } from '@/config/thinkingConfig';

type UseFetchAIMessageProps = {
  setMessageList: React.Dispatch<React.SetStateAction<MessageItem[]>>;
  apiKey: string;
  api: string;
  model: string;
  reasoningEnabled?: boolean;
  messageList: MessageItem[];
  onUpdateAIResponse: (res: AIMessageRenderProps) => void;
};

/**
 * Custom hook to fetch AI messages.
 * @param param0 - The parameters for fetching AI messages.
 * @returns A function to fetch AI messages.
 */
export const useFetchAIMessage = ({
  setMessageList,
  messageList: _messageList,
  onUpdateAIResponse,
  ...props
}: UseFetchAIMessageProps) => {
  const fetchAIMessage = async (newMessageList: MessageItem[]) => {
    // 2. Send message to AI
    // 2.1 Push the AI message to message list.
    const aiMessage: AIMessageRenderProps = {
      content: '',
      reasoningContentCompleted: false,
      model: props.model,
    };

    setMessageList([...newMessageList, { role: 'assistant', data: aiMessage }]);

    const client = new OpenAI({
      apiKey: props.apiKey,
      baseURL: props.api,
      dangerouslyAllowBrowser: true,
    });

    // 1. Prepare request messages using the latest list passed in
    const messages = newMessageList.map((item) => ({
      role: item.role,
      content: item.role === 'user' ? item.content : item.data.content,
    }));

    // Build request config and include reasoning only when enabled
    let requestConfig: ChatCompletionCreateParamsStreaming = {
      model: props.model,
      messages,
      stream: true,
      stream_options: {
        include_usage: true,
      },
    };

    requestConfig = addThinkingArgument(
      requestConfig,
      props.model,
      !!props.reasoningEnabled
    ) as ChatCompletionCreateParamsStreaming;

    const completion = await client.chat.completions.create(requestConfig);

    for await (const part of completion) {
      // 1.1 Check for usage information
      if (part?.choices?.[0]?.delta) {
        // 1.2 Process delta content
        const res = part.choices[0].delta as AIResponse;

        aiMessage.content += res.content || '';

        // Only process reasoning content if the feature is enabled
        if (props.reasoningEnabled) {
          const reasoningContent = res.reasoning_content || res.reasoningContent || '';
          if (reasoningContent) {
            if (aiMessage.reasoningContent) {
              aiMessage.reasoningContent += reasoningContent;
            } else {
              aiMessage.reasoningContent = reasoningContent;
            }
          }
        }

        onUpdateAIResponse(aiMessage);
      }

      if (part?.usage) {
        aiMessage.usage = {
          promptTokens: part.usage!.prompt_tokens,
          completionTokens: part.usage!.completion_tokens,
          totalTokens: part.usage!.total_tokens,
        };

        onUpdateAIResponse(aiMessage);
      }
    }
  };

  return fetchAIMessage;
};

const addThinkingArgument = (props: unknown, model: string, enable: boolean) => {
  if (enable) {
    // @ts-expect-error Intentionally accessing property on unknown type for dynamic configuration
    props.reasoning_effort = 'low';
  }
  const lowerCaseMapKey: Map<string, string> = new Map();
  const modelSet = new Set(
    Object.keys(thinkingConfig).map((item) => {
      const lowerCaseItem = item.toLowerCase();

      lowerCaseMapKey.set(lowerCaseItem, item);

      return lowerCaseItem;
    })
  );
  const currentModel = model.toLowerCase();

  const hasModel = modelSet.has(currentModel);
  if (!hasModel) {
    return props;
  }

  // 2.2 Find the model.
  const keyName = lowerCaseMapKey.get(currentModel);
  const cfg = thinkingConfig[keyName!];

  if (!cfg) {
    return props;
  }

  const queryPath = cfg.query;
  const parts = queryPath.split('.');
  let cur: Record<string, unknown> = props as Record<string, unknown>;
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    if (i === parts.length - 1) {
      const value = enable ? cfg.enable : cfg.disable;

      cur[key] = value;
    } else {
      if (typeof cur[key] !== 'object' || cur[key] === null) {
        cur[key] = {};
      }
      cur = cur[key] as Record<string, unknown>;
    }
  }

  return props;
};
