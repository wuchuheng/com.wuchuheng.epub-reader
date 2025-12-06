export type AiProviderId =
  | 'openai'
  | 'openrouter'
  | 'together'
  | 'mistral'
  | 'groq'
  | 'fireworks'
  | 'deepseek'
  | 'cerebras'
  | 'perplexity'
  | 'zhipu'
  | 'qwen'
  | 'kimi'
  | 'minimax'
  | 'custom';

export interface AiProviderConfig {
  id: AiProviderId;
  name: string;
  baseUrl?: string;
  docsUrl?: string;
}

export const AI_PROVIDER_CATALOG: AiProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    docsUrl: 'https://platform.openai.com/docs/api-reference',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    docsUrl: 'https://openrouter.ai/docs',
  },
  {
    id: 'together',
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    docsUrl: 'https://docs.together.ai/docs/introduction',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    docsUrl: 'https://docs.mistral.ai/',
  },
  {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    docsUrl: 'https://console.groq.com/docs/openai',
  },
  {
    id: 'fireworks',
    name: 'Fireworks AI',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    docsUrl: 'https://docs.fireworks.ai/api-reference/introduction',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek(深度求索)',
    baseUrl: 'https://api.deepseek.com',
    docsUrl: 'https://api-docs.deepseek.com/',
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    baseUrl: 'https://api.cerebras.ai/v1',
    docsUrl: 'https://inference-docs.cerebras.ai/',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    baseUrl: 'https://api.perplexity.ai',
    docsUrl: 'https://docs.perplexity.ai/',
  },
  {
    id: 'zhipu',
    name: 'Zhipu GLM(智谱)',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    docsUrl: 'https://open.bigmodel.cn/dev/api',
  },
  {
    id: 'qwen',
    name: 'Qwen (千问)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    docsUrl: 'https://help.aliyun.com/zh/model-studio/developer-reference/use-qwen-by-calling-api',
  },
  {
    id: 'kimi',
    name: 'Kimi (月之暗面)',
    baseUrl: 'https://api.moonshot.cn/v1',
    docsUrl: 'https://platform.moonshot.cn/docs/api/chat-completion',
  },
  {
    id: 'minimax',
    name: 'Minimax',
    baseUrl: 'https://api.minimax.io/v1',
    docsUrl: 'https://platform.minimaxi.com/',
  },
  {
    id: 'custom',
    name: 'OpenAI compatible (custom)',
    baseUrl: undefined, // User must provide
    docsUrl: undefined,
  },
];
