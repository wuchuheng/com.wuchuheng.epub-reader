# Feature: Default AI Tools & Smart Context Handling

## Goal
The objective was to enhance the "Immersive Reader" experience by providing a set of high-quality, pre-configured AI tools in the context menu. These tools are designed to help users understand text more deeply by providing context-aware definitions, synonyms, and translations.

Additionally, a robust mechanism was needed to ensure that the context passed to the AI models is always properly wrapped in XML tags (e.g., `<context>...</context>`), regardless of whether the prompt template explicitly includes them.

## Changes Implemented

### 1. Default AI Tools Configuration
We updated `src/config/config.ts` to include three specialized AI tools by default:

*   **Context Dict (Ctx)**: An "AI Deep Context Dictionary" that provides definitions, grammatical analysis, and specific reference links (what "it" refers to) based on the surrounding text.
*   **Synonyms (Syn)**: A vocabulary expert that lists 3-4 high-quality synonyms, explaining nuances and collocations specifically relevant to the current context.
*   **Translation (Trans)**: A context-aware translator that performs precise translation, disambiguation, and tone adjustment based on the background information.

### 2. Smart Context Wrapping Logic
We enhanced the variable replacement logic in `src/pages/EpubReader/components/AIAgent/utils.ts`.

*   **Problem**: Some prompts might write `<context>{{context}}</context>`, while others might just write `{{context}}`. We needed a way to ensure the final output always has the tags without doubling them up.
*   **Solution**: The `replaceWords` function now checks the template string:
    *   If `{{context}}` is already surrounded by `<context>` tags in the template, it replaces the variable directly.
    *   If the tags are missing, it wraps the injected context value in `<context>` tags automatically.

### 3. Code Adjustments
*   **`src/config/config.ts`**: Updated the `menuItemDefaultConfig` array with the new prompts.
*   **`src/pages/EpubReader/components/AIAgent/utils.ts`**: implemented the `isWrapped` detection regex and conditional replacement.
*   **`src/pages/EpubReader/components/AIAgent/components/MessageList/MessageList.tsx`**: Cleaned up the usage of `replaceWords` to rely on the new internal logic.

## Verification
These changes ensure that when a user selects text and uses a default AI tool, the LLM receives a prompt with a clearly delimited context block, improving the accuracy of the AI's response.
