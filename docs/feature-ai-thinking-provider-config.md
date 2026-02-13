# Specification: Provider-Aware AI Thinking Configuration

## 1. Overview
This feature introduces a more flexible and provider-aware way to manage AI "thinking" (reasoning) capabilities. Different AI providers (like Zhipu, OpenAI, DeepSeek) use different parameters to enable reasoning features. This specification defines how to move these configurations into the provider catalog and add a global user setting for easier management.

## 2. Architecture & Data Changes

### 2.1 AI Provider Catalog (`src/config/aiProviders.ts`)
The `AiProviderConfig` interface will be extended to include a `thinkingConfig` property.

```typescript
export interface ThinkingConfig {
  enable: Record<string, unknown>;
  disable: Record<string, unknown>;
}

export interface AiProviderConfig {
  id: AiProviderId;
  name: string;
  baseUrl?: string;
  docsUrl?: string;
  thinkingConfig?: ThinkingConfig; // New optional property
}
```

### 2.2 Global Settings (`src/types/epub.ts`)
Add a `globalReasoningEnabled` flag to the `ContextMenuSettings` type.

```typescript
export type ContextMenuSettings = {
  // ... existing fields
  globalReasoningEnabled?: boolean; // New global toggle
};
```

## 3. Implementation Details

### 3.1 Settings Management
1.  **`useContextMenuSettings.ts`**:
    *   Add `globalReasoningEnabled` to the initial state and loading logic.
    *   Implement `updateGlobalReasoningEnabled(enabled: boolean)` action.
2.  **`ContextMenuSettingsPage/index.tsx`**:
    *   Add a toggle in the sidebar (General Settings) to allow users to enable/disable reasoning globally.

### 3.2 AI Request Logic (`useFetchAIMessage.ts`)
The `addThinkingArgument` function will be refactored to prioritize provider-specific configurations.

**Revised Logic for `addThinkingArgument(requestConfig, model, providerId, enable)`:**
1.  **Provider-Specific Check**:
    *   Look up the provider in `AI_PROVIDER_CATALOG` using `providerId`.
    *   If the provider has a `thinkingConfig`:
        *   Deep merge the `enable` or `disable` object into `requestConfig` based on the `enable` parameter.
        *   Return the modified `requestConfig`.
2.  **Model-Specific Fallback** (Existing Logic):
    *   If no provider config is found, check `src/config/thinkingConfig.ts` for model-based rules (useful for legacy or specific model overrides).
3.  **OpenAI Standard Fallback**:
    *   If still no specific config is found and `enable` is true, apply the OpenAI standard: `requestConfig.reasoning_effort = 'low'`.

### 3.3 Data Flow
1.  `ContextMenuSettingsPage` saves `globalReasoningEnabled`.
2.  `EpubReader` passes `providerId` and `globalReasoningEnabled` to `ContextMenuComponent`.
3.  `ContextMenuComponent` passes these to `AIAgent`.
4.  `AIAgent` computes the effective `reasoningEnabled` (likely `item.reasoningEnabled || globalReasoningEnabled`) and passes it along with `providerId` to `useFetchAIMessage`.

## 4. User Interface

### 4.1 Global Toggle
A new section or item in the "General Settings" sidebar of the Context Menu Settings page:
*   **Label**: Enable AI Thinking/Reasoning
*   **Description**: Enable deep thinking capabilities for supported models.

## 5. Backward Compatibility
*   Existing tools with `reasoningEnabled` set will continue to work.
*   If `globalReasoningEnabled` is undefined, it defaults to `false`.
*   The system will still fall back to the existing `thinkingConfig.ts` if a provider doesn't have a specific configuration yet.
