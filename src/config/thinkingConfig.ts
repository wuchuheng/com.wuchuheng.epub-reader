type ConfigItem = {
  query: string;
  disable?: 'disabled';
  enable?: 'enabled';
};

const glmConfig: ConfigItem = { query: 'thinking.type', disable: 'disabled', enable: 'enabled' };

/**
 * Adapted thinking configuration for the AI agent.
 */
export const thinkingConfig: Record<string, ConfigItem> = {
  'glm-4.5': glmConfig,
  'glm-4.5-air': glmConfig,
  'glm-4.5-x': glmConfig,
  'glm-4.5-flash': glmConfig,
  'glm-4.5v': glmConfig,
  'glm-4.1v-thinking-flashx': glmConfig,
  'glm-4.1v-thinking-flash': glmConfig,
  'glm-z1-air': glmConfig,
  'glm-z1-airx': glmConfig,
  'glm-z1-flash': glmConfig,
  'glm-z1-flashx': glmConfig,
  'glm-4-air-250414': glmConfig,
  'glm-4-flash-250414': glmConfig,
  'glm-4-plus': glmConfig,
  'glm-4-air': glmConfig,
  'glm-4-airx': glmConfig,
  'glm-4-flash': glmConfig,
  'glm-4-flashx': glmConfig,
  'glm-4v-plus-0111': glmConfig,
  'glm-4v-flash': glmConfig,
};
