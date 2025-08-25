import React, { useState, useEffect, useRef, useCallback } from 'react';
import OpenAI from 'openai';
import { AISettingItem, ContextMenuSettings } from '../../../../types/epub';
import { ContextMenuProps } from '../ContextMenu';
import { logger } from '../../../../utils/logger';

/**
 * Props for the AIAgent component.
 */
type AIAgentProps = Pick<AISettingItem, 'model' | 'prompt' | 'reasoningEnabled'> &
  Pick<ContextMenuProps, 'words' | 'context'> &
  Pick<ContextMenuSettings, 'api'> & {
    apiKey: string; // Renamed from 'key' to avoid React's reserved prop
  };

/**
 * Response state for the AI agent.
 */
interface AIResponse {
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
  error: string | null;
}

/**
 * AI Agent component that processes text selections with configurable AI providers.
 * Supports streaming responses and proper error handling.
 */
export const AIAgent: React.FC<AIAgentProps> = (props) => {
  const [response, setResponse] = useState<AIResponse>({
    content: '',
    isStreaming: false,
    isComplete: false,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const responseContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Processes the user prompt by replacing placeholders with actual values.
   */
  const processPrompt = (prompt: string, words: string, context: string): string =>
    prompt
      .replace(/\{words\}/g, words)
      .replace(/\{context\}/g, context)
      .replace(/\{selectedText\}/g, words);

  /**
   * Validates input parameters and returns error message if invalid.
   */
  const validateInputs = useCallback((): string | null => {
    // 1. Check configuration completeness
    if (!props.api || !props.apiKey || !props.prompt) {
      const missingFields = [];
      if (!props.api) missingFields.push('API endpoint');
      if (!props.apiKey) missingFields.push('API key');
      if (!props.prompt) missingFields.push('prompt');
      
      return `Missing configuration: ${missingFields.join(', ')}. Please check your context menu settings.`;
    }

    // 2. Check selected text availability
    if (!props.words?.trim()) {
      return 'No text selected. Please select some text first.';
    }

    return null;
  }, [props.api, props.apiKey, props.prompt, props.words]);

  /**
   * Creates OpenAI client instance with proper configuration.
   */
  const createOpenAIClient = useCallback((): OpenAI => new OpenAI({
    apiKey: props.apiKey,
    baseURL: props.api,
    dangerouslyAllowBrowser: true,
  }), [props.apiKey, props.api]);

  /**
   * Attempts streaming response from AI provider.
   */
  const tryStreamingResponse = useCallback(async (openai: OpenAI, processedPrompt: string): Promise<string> => {
    const stream = await openai.chat.completions.create({
      model: props.model,
      messages: [{ role: 'user', content: processedPrompt }],
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
    }, {
      signal: abortControllerRef.current!.signal,
    });

    let accumulatedContent = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      
      if (delta) {
        accumulatedContent += delta;
        setResponse(prev => ({ ...prev, content: accumulatedContent }));
      }
    }

    return accumulatedContent;
  }, [props.model]);

  /**
   * Falls back to non-streaming response if streaming fails.
   */
  const tryNonStreamingResponse = useCallback(async (openai: OpenAI, processedPrompt: string): Promise<string> => {
    const response = await openai.chat.completions.create({
      model: props.model,
      messages: [{ role: 'user', content: processedPrompt }],
      stream: false,
      max_tokens: 1000,
      temperature: 0.7,
    }, {
      signal: abortControllerRef.current!.signal,
    });

    const content = response.choices[0]?.message?.content || '';
    setResponse(prev => ({ ...prev, content }));
    
    return content;
  }, [props.model]);

  /**
   * Handles API errors with specific error messages.
   */
  const handleAPIError = (error: unknown): string => {
    if (error instanceof Error && error.name === 'AbortError') {
      logger.info('AI Agent request aborted');
      throw error; // Re-throw to handle in caller
    }

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) return 'Invalid API key. Please check your authentication settings.';
      if (error.status === 429) return 'Rate limit exceeded. Please try again later.';
      if (error.status === 500) return 'Server error. Please try again later.';
      
      return `API Error: ${error.message}`;
    }

    return error instanceof Error ? error.message : 'Unknown error occurred';
  };

  /**
   * Makes API call to the configured AI provider with streaming support.
   */
  const callAIProvider = useCallback(async (): Promise<void> => {
    // 1. Input validation and preparation
    logger.info('AI Agent starting', {
      hasApi: !!props.api,
      hasApiKey: !!props.apiKey,
      hasPrompt: !!props.prompt,
      hasWords: !!props.words,
      baseUrl: props.api || 'empty',
      model: props.model,
    });

    const validationError = validateInputs();
    if (validationError) {
      setResponse(prev => ({ ...prev, error: validationError, isComplete: true }));
      return;
    }

    // 2. Core processing - AI API interaction
    try {
      setIsLoading(true);
      setResponse({ content: '', isStreaming: true, isComplete: false, error: null });

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const processedPrompt = processPrompt(props.prompt, props.words, props.context);
      const openai = createOpenAIClient();

      logger.info('AI Agent request started', {
        model: props.model,
        words: props.words,
        promptLength: processedPrompt.length,
        baseURL: props.api,
      });

      let accumulatedContent = '';
      
      try {
        accumulatedContent = await tryStreamingResponse(openai, processedPrompt);
      } catch (streamError) {
        logger.warn('Streaming failed, falling back to non-streaming', { error: streamError });
        accumulatedContent = await tryNonStreamingResponse(openai, processedPrompt);
      }

      setResponse(prev => ({ ...prev, isStreaming: false, isComplete: true }));
      
      logger.info('AI Agent request completed', {
        responseLength: accumulatedContent.length,
        words: props.words,
      });

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was aborted, no need to show error
      }

      const errorMessage = handleAPIError(error);
      logger.error('AI Agent request failed', { error: errorMessage, words: props.words });
      
      setResponse(prev => ({
        ...prev,
        error: errorMessage,
        isStreaming: false,
        isComplete: true,
      }));
    } finally {
      // 3. Output handling - cleanup
      setIsLoading(false);
    }
  }, [props.api, props.apiKey, props.prompt, props.words, props.context, props.model, validateInputs, createOpenAIClient, tryStreamingResponse, tryNonStreamingResponse]);

  /**
   * Copies the AI response to clipboard.
   */
  const copyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(response.content);
      logger.info('AI response copied to clipboard');
    } catch (error) {
      logger.error('Failed to copy to clipboard', { error });
    }
  };

  /**
   * Regenerates the AI response.
   */
  const regenerateResponse = (): void => {
    callAIProvider();
  };

  /**
   * Clears the current response.
   */
  const clearResponse = (): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setResponse({
      content: '',
      isStreaming: false,
      isComplete: false,
      error: null,
    });
    setIsLoading(false);
  };

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (responseContainerRef.current) {
      responseContainerRef.current.scrollTop = responseContainerRef.current.scrollHeight;
    }
  }, [response.content]);

  // Auto-start processing when component mounts
  useEffect(() => {
    callAIProvider();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [callAIProvider]);

  return (
    <div className="flex h-full flex-col">
      {/* Input Section */}
      <div className="border-b border-gray-200 p-4">
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-700">Selected Text:</span>
          <p className="mt-1 rounded border bg-gray-50 p-2 text-sm text-gray-900">{props.words}</p>
        </div>

        {props.context && (
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-700">Context:</span>
            <p className="mt-1 line-clamp-3 rounded border bg-gray-50 p-2 text-xs text-gray-600">
              {props.context}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Model: {props.model}</span>
          <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">AI Assistant</span>
        </div>
      </div>

      {/* Response Section */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div ref={responseContainerRef} className="flex-1 overflow-y-auto p-4">
          {response.error ? (
            <div className="rounded border border-red-200 bg-red-50 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Configuration Error</h3>
                  <div className="mt-2 text-sm text-red-700">{response.error}</div>
                  {(response.error.includes('API endpoint') ||
                    response.error.includes('API key') ||
                    response.error.includes('Invalid API key')) && (
                    <div className="mt-3 text-sm text-red-700">
                      <p className="font-medium">To configure AI settings:</p>
                      <ol className="mt-1 list-inside list-decimal space-y-1">
                        <li>Go to Settings → Context Menu</li>
                        <li>Set your API base URL (e.g., https://api.openai.com/v1)</li>
                        <li>Add your valid API key (e.g., sk-...)</li>
                        <li>Configure your AI tools with models and prompts</li>
                      </ol>
                      <div className="mt-2 text-xs text-red-600">
                        <p>
                          <strong>Supported providers:</strong> OpenAI, Anthropic, or any
                          OpenAI-compatible API
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {(isLoading || response.isStreaming) && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <span>{isLoading ? 'Connecting...' : 'Generating response...'}</span>
                </div>
              )}

              {response.content && (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900">
                    {response.content}
                  </pre>
                </div>
              )}

              {response.isComplete && response.content && (
                <div className="border-t pt-2 text-xs text-gray-500">Response complete</div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex space-x-2">
            <button
              onClick={regenerateResponse}
              disabled={isLoading || response.isStreaming}
              className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Regenerate
            </button>

            {response.content && !response.error && (
              <button
                onClick={copyToClipboard}
                className="flex-1 rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Copy
              </button>
            )}

            <button
              onClick={clearResponse}
              disabled={isLoading || response.isStreaming}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
