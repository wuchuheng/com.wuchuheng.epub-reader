import React from 'react';
import OpenAI from 'openai';
import type { ChatCompletionCreateParamsStreaming } from 'openai/resources/chat/completions';
import type { AIMessageRenderProps } from '../AIMessageRender';
import type { AIResponse, MessageItem } from '../../types/AIAgent';
import { thinkingConfig } from '@/config/thinkingConfig';
import { checkAIToolCache, saveAIToolCache } from '@/services/ContextMenuCacheService';
import { waitForQueueSlot, type QueueTicket } from '@/services/aiRequestQueue';
import { logger } from '@/utils/logger';
import { DEFAULT_CONFIG } from '@/constants/epub';

type UseFetchAIMessageProps = {
  setMessageList: React.Dispatch<React.SetStateAction<MessageItem[]>>;
  apiKey: string;
  api: string;
  model: string;
  reasoningEnabled?: boolean;
  onUpdateAIResponse: (res: AIMessageRenderProps) => void;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  contextId: number; // Cache context ID
  toolName: string; // Tool name for cache filename
  maxConcurrentRequests: number;
};

/**
 * Custom hook to fetch AI messages.
 * @param param0 - The parameters for fetching AI messages.
 * @returns A function to fetch AI messages.
 */
export const useFetchAIMessage = ({
  setMessageList,
  onUpdateAIResponse,
  ...props
}: UseFetchAIMessageProps) => {
  const setFailureMessage = (message: string) => {
    setMessageList((prev) => {
      if (!prev.length || prev[prev.length - 1].role !== 'assistant') {
        return [
          ...prev,
          {
            role: 'assistant',
            data: {
              content: message,
              model: props.model,
              reasoningContentCompleted: true,
            },
          },
        ];
      }
      const clone = [...prev];
      const latest = clone[clone.length - 1];
      if (latest.role === 'assistant') {
        clone[clone.length - 1] = {
          role: 'assistant',
          data: {
            ...latest.data,
            content: message,
            reasoningContentCompleted: true,
          },
        };
      }
      return clone;
    });
  };

  const fetchAIMessage = React.useCallback(
    async (newMessageList: MessageItem[], options?: { ignoreCache?: boolean }) => {
      let queueTicket: QueueTicket | null = null;

      if (
        !options?.ignoreCache &&
        newMessageList.length === 1 &&
        newMessageList[0].role === 'user'
      ) {
        logger.log(
          `[useFetchAIMessage] Checking cache for tool "${props.toolName}" (context ${props.contextId})`
        );

        const cachedResponse = await checkAIToolCache(props.contextId, props.toolName);

        if (cachedResponse) {
          logger.log(
            `[useFetchAIMessage] ⚡️ Cache HIT! Using cached response for "${props.toolName}"`
          );

          const restoredMessages: MessageItem[] = cachedResponse.conversations.map((msg) => {
            if (msg.role === 'user') {
              return { role: 'user', content: msg.content };
            }
            return {
              role: 'assistant',
              data: {
                content: msg.content,
                model: cachedResponse.model,
                reasoningContentCompleted: true,
                usage: {
                  promptTokens: cachedResponse.tokenUsage.prompt,
                  completionTokens: cachedResponse.tokenUsage.completion,
                  totalTokens: cachedResponse.tokenUsage.total,
                },
              },
            };
          });

          setMessageList(restoredMessages);
          logger.log(`[useFetchAIMessage] ✅ Cache restored ${restoredMessages.length} messages`);
          return;
        }

        logger.log(`[useFetchAIMessage] Cache MISS - fetching from API`);
      }

      const aiMessage: AIMessageRenderProps = {
        content: '',
        reasoningContentCompleted: false,
        model: props.model,
      };

      setMessageList([...newMessageList, { role: 'assistant', data: aiMessage }]);

      props.abortControllerRef.current?.abort();
      const abortController = new AbortController();
      props.abortControllerRef.current = abortController;

      const client = new OpenAI({
        apiKey: props.apiKey,
        baseURL: props.api,
        dangerouslyAllowBrowser: true,
      });

      const messages = newMessageList.map((item) => ({
        role: item.role,
        content: item.role === 'user' ? item.content : item.data.content,
      }));

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

      const concurrencyLimit = Math.max(
        props.maxConcurrentRequests ?? DEFAULT_CONFIG.DEFAULT_MAX_CONCURRENT_REQUESTS,
        1
      );

      queueTicket = await waitForQueueSlot(props.api, concurrencyLimit);

      try {
        const completion = await client.chat.completions.create(requestConfig, {
          signal: abortController.signal,
        });

        for await (const part of completion) {
          if (abortController.signal.aborted) {
            break;
          }

          if (part?.choices?.[0]?.delta) {
            const res = part.choices[0].delta as AIResponse;

            aiMessage.content += res.content || '';

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
      } catch (error) {
        if (!abortController.signal.aborted) {
          const message = error instanceof Error ? error.message : 'Request failed';
          setFailureMessage(message);
        }
      } finally {
        queueTicket?.done();
        props.abortControllerRef.current = null;

        if (
          newMessageList.length === 1 &&
          newMessageList[0].role === 'user' &&
          aiMessage.usage &&
          aiMessage.content
        ) {
          logger.log(`[useFetchAIMessage] Saving response to cache for tool "${props.toolName}"`);

          const userMessage = newMessageList[0];

          try {
            await saveAIToolCache(props.contextId, props.toolName, {
              toolName: props.toolName,
              conversations: [
                { role: 'user', content: userMessage.content },
                { role: 'assistant', content: aiMessage.content },
              ],
              tokenUsage: {
                prompt: aiMessage.usage.promptTokens,
                completion: aiMessage.usage.completionTokens,
                total: aiMessage.usage.totalTokens,
              },
              updatedAt: new Date().toISOString(),
              model: props.model,
            });

            logger.log(`[useFetchAIMessage] ✅ Cache saved successfully`);
          } catch (cacheError) {
            logger.error(`[useFetchAIMessage] Failed to save cache:`, cacheError);
          }
        }
      }
    },
    [
      onUpdateAIResponse,
      props.abortControllerRef,
      props.api,
      props.apiKey,
      props.contextId,
      props.maxConcurrentRequests,
      props.model,
      props.reasoningEnabled,
      props.toolName,
      setFailureMessage,
      setMessageList,
    ]
  );

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
