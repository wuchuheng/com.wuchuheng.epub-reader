import React, { useCallback, useEffect, useRef, useState } from 'react';
import OpenAI from 'openai';
import { AISettingItem, ContextMenuSettings } from '../../../../types/epub';
import { ContextMenuProps } from '../ContextMenu';
import { UserMessageRender } from './components/UserMessage';
import { replaceWords } from './utils';
import { AIMessageRender, AIMessageRenderProps } from './components/AIMessageRender';
import { InputBarRender, InputBarRenderProps } from './components/InputBarRender';

/**
 * Props for the AIAgent component.
 */
export type AIAgentProps = Pick<AISettingItem, 'model' | 'prompt' | 'reasoningEnabled'> &
  Pick<ContextMenuProps, 'words' | 'context'> &
  Pick<ContextMenuSettings, 'api'> & {
    apiKey: string; // Renamed from 'key' to avoid React's reserved prop
  };

type AIResponse = {
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

type MessageItem = UserMessage | AIMessage;

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
  const [messageList, setMessageList] = useState<MessageItem[]>([
    {
      role: 'user',
      content,
      highlightWords: props.words,
    },
  ]);

  const conversationRef = useRef<HTMLDivElement>(null);

  const onUpdateAIResponse = (res: AIMessageRenderProps) => {
    // 2. Handle logic.
    // 2.1 Update the latest message, that must be AI type message.
    setMessageList((prev) => {
      const latest = prev[prev.length - 1];
      if (latest.role !== 'assistant') {
        throw new Error('Latest message is not AI type');
      }
      prev[prev.length - 1] = { ...latest, data: { ...latest.data, ...res } };

      return [...prev];
    });

    // 2.2 Scroll the conversation to bottom smoothly
    if (conversationRef.current) {
      conversationRef.current.scrollTo({
        top: conversationRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const fetchAIMessage = async (newMessageList: MessageItem[]) => {
    // 2. Send message to AI
    // 2.1 Push the AI message to message list.
    const aiMessage: AIMessageRenderProps = {
      content: '',
      reasoningContentCompleted: false,
    };

    setMessageList([...newMessageList, { role: 'assistant', data: aiMessage }]);

    const client = new OpenAI({
      apiKey: props.apiKey,
      baseURL: props.api,
      dangerouslyAllowBrowser: true,
    });

    const messages = messageList.map((item) => ({
      role: item.role,
      content: item.role === 'user' ? item.content : item.data.content,
    }));

    const completion = await client.chat.completions.create({
      model: props.model,
      messages,
      stream: true,
      reasoning_effort: 'low',
      stream_options: {
        include_usage: true,
      },
    });

    for await (const part of completion) {
      // 1.1 Check for usage information
      if (part?.choices?.[0]?.delta) {
        // 1.2 Process delta content
        const res = part.choices[0].delta as AIResponse;

        aiMessage.content += res.content || '';

        const reasoningContent = res.reasoning_content || res.reasoningContent || '';
        if (reasoningContent) {
          if (aiMessage.reasoningContent) {
            aiMessage.reasoningContent += reasoningContent;
          } else {
            aiMessage.reasoningContent = reasoningContent;
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

  useEffect(() => {
    fetchAIMessage(messageList);
  }, []);
  const [inputBarStatus, setInputBarStatus] = useState<InputBarRenderProps['status']>('idle');

  const onSend = useCallback(
    (msg: string) => {
      const msgList: MessageItem[] = [...messageList, { role: 'user', content: msg }];
      fetchAIMessage(msgList);
    },
    [messageList]
  );

  return (
    <div className="relative flex h-full flex-col overflow-y-scroll" ref={conversationRef}>
      <div className="flex flex-1 flex-col gap-2 divide-y divide-gray-300 p-4">
        {messageList.map((msg, index) => {
          if (msg.role === 'user') {
            return <UserMessageRender key={index} {...msg} />;
          }
          return <AIMessageRender key={index} {...msg.data} />;
        })}
      </div>
      <InputBarRender
        status={inputBarStatus}
        onStop={() => setInputBarStatus('idle')}
        onSend={onSend}
      />
    </div>
  );
};
