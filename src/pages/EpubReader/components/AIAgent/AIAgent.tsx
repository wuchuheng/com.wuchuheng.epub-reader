import React, { useEffect, useState } from 'react';
import OpenAI from 'openai';
import { AISettingItem, ContextMenuSettings } from '../../../../types/epub';
import { ContextMenuProps } from '../ContextMenu';
import { UserMessage } from './components/UserMessage';
import { replaceWords } from './utils';
import { AIMessageRender } from './components/AIMessageRender';

/**
 * Props for the AIAgent component.
 */
export type AIAgentProps = Pick<AISettingItem, 'model' | 'prompt' | 'reasoningEnabled'> &
  Pick<ContextMenuProps, 'words' | 'context'> &
  Pick<ContextMenuSettings, 'api'> & {
    apiKey: string; // Renamed from 'key' to avoid React's reserved prop
  } & {
    conversationRef: React.RefObject<HTMLDivElement>;
  };

type AIResponse = {
  content?: string;
  reasoning_content?: string;
};

/**
 * AI Agent component that provides a chat interface for AI interactions.
 * Supports streaming responses and conversation history.
 */
export const AIAgent: React.FC<AIAgentProps> = (props) => {
  const content = replaceWords({
    template: props.prompt,
    words: props.words,
    context: props.context,
  });

  const [reasoningContent, setReasoningContent] = React.useState<string>('');
  const [aiContent, setAIContent] = useState<string>('');

  const conversationRef = props.conversationRef;

  const onUpdateAIResponse = (res: AIResponse) => {
    // 2. Update content based on response structure
    if (res.reasoning_content) {
      setReasoningContent((prev) => prev + (res.reasoning_content ?? ''));
    }

    if (res.content) {
      setAIContent((prev) => prev + (res.content ?? ''));
    }

    // 2.2 Scroll the conversation to bottom smoothly
    if (conversationRef.current) {
      conversationRef.current.scrollTo({
        top: conversationRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const fetchAIMessage = async () => {
    // 1. Prepare request payload

    const client = new OpenAI({
      apiKey: props.apiKey,
      baseURL: props.api,
      dangerouslyAllowBrowser: true,
    });

    const completion = await client.chat.completions.create({
      model: props.model,
      messages: [{ role: 'user', content }],
      stream: true,
      reasoning_effort: 'medium',
      stream_options: {
        include_usage: true,
      },
    });

    for await (const part of completion) {
      // 1.1 Check for usage information
      if (part?.usage) {
        console.log('Token usage:', {
          promptTokens: part.usage.prompt_tokens,
          completionTokens: part.usage.completion_tokens,
          totalTokens: part.usage.total_tokens,
        });
      }
      if (part?.choices?.[0]?.delta) {
        // 1.2 Process delta content
        const res = part.choices[0].delta as AIResponse;
        onUpdateAIResponse(res);
      }
    }
  };

  useEffect(() => {
    fetchAIMessage();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-2 divide-y divide-gray-300 p-4">
        <UserMessage role="User" content={content} hightWords={props.words} />
        <AIMessageRender content={aiContent} reasoningContent={reasoningContent} />
      </div>
    </div>
  );
};
