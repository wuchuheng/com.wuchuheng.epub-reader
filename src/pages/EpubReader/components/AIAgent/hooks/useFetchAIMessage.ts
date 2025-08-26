import OpenAI from 'openai';
import type { ChatCompletionCreateParamsStreaming } from 'openai/resources/chat/completions';
import { AIMessageRenderProps } from '../components/AIMessageRender';
import { AIResponse, MessageItem } from '../types/AIAgent';

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
    const requestConfig: ChatCompletionCreateParamsStreaming = {
      model: props.model,
      messages,
      stream: true,
      stream_options: {
        include_usage: true,
      },
    };

    if (props.reasoningEnabled) {
      requestConfig.reasoning_effort = 'low';
    } else {
      // Ensure no reasoning params are sent when disabled
      // (requestConfig already lacks reasoning-specific fields)
    }

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
