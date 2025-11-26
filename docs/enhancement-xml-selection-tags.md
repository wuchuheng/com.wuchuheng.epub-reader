# Enhancement Specification: Custom XML Tags for Selection

## 1. Problem Description
Currently, the application uses markdown-style double asterisks (`**word**`) to highlight the selected text within the context string. The user has requested to use custom XML tags (e.g., `<selected>word</selected>`) instead. This provides a more semantic and robust way to identify the selected text, especially when interacting with AI agents that might interpret markdown in unexpected ways.

## 2. Proposed Changes

### 2.1. Update `selection.service.ts`
Modify the `extractSelectionToWords` function to wrap the selected text with `<selected>` tags instead of `**`.

**Old:**
```typescript
const context = `${preText}**${selectedText}**${postText}`;
```

**New:**
```typescript
const context = `${preText}<selected>${selectedText}</selected>${postText}`;
```

### 2.2. Update `UserMessage.tsx`
The `UserMessageRender` component currently tries to highlight words by adding `**` around them using regex. This logic needs to be updated to be compatible with the new XML tag format or adjusted if it's redundant.

*   **Current Logic:** It takes `props.content` and `props.hightWords`. It finds `hightWords` in `content` and wraps them in `**`.
*   **Issue:** The `content` passed to `UserMessageRender` in the initial message *already* contains the highlighted text (from `selection.service.ts`).
    *   In `MessageList.tsx`, the initial user message is created with `content` derived from `replaceWords`, which uses the `context` from `selection.service.ts`.
    *   So, the initial message will have `<selected>...</selected>`.
*   **Markdown Compatibility:** `MarkdownRender` (used by `UserMessageRender`) likely won't render `<selected>` tags visually as bold text by default. It might treat them as HTML or plain text.
*   **Resolution:**
    1.  **For AI Consumption:** The AI receives the raw string with `<selected>` tags, which is the desired outcome.
    2.  **For UI Display:** The `UserMessageRender` needs to visually highlight the text inside `<selected>` tags.
        *   We can pre-process the content before passing it to `MarkdownRender`.
        *   Regex replace `<selected>(.*?)</selected>` with `**$1**` solely for the *display* component. This keeps the underlying data as XML for the AI but uses Markdown for the UI.

### 2.3. Update `AIAgent/utils.ts`
No changes needed. `replaceWords` is a simple string replacement and doesn't care about the content.

### 2.4. Update `MessageList.tsx`
No changes needed. It passes the `context` string as-is.

## 3. Implementation Plan

1.  **Modify `src/pages/EpubReader/services/selection.service.ts`**:
    *   Change the context construction line to use `<selected>` tags.

2.  **Modify `src/pages/EpubReader/components/AIAgent/components/UserMessage.tsx`**:
    *   In `UserMessageRender`, add a preprocessing step.
    *   Before setting the `content` state or passing it to `MarkdownRender`, replace all instances of `<selected>` with `**` and `</selected>` with `**`.
    *   This ensures the user still *sees* bold text in the chat UI, even though the AI *receives* XML tags.

## 4. Verification
1.  Select text in the reader.
2.  Open the AI chat.
3.  **Visual Check:** The selected text in the user's message bubble should still be bold (or highlighted).
4.  **Logic Check:** The actual prompt sent to the AI (if we were logging it) would contain `<selected>...</selected>`.

## 5. Refined `UserMessageRender` Logic

```typescript
export const UserMessageRender: React.FC<MessageRenderProps> = (props) => {
  const [content, setContent] = React.useState(props.content);

  useEffect(() => {
    let newContent = props.content;

    // 1. Convert XML tags to Markdown for display
    newContent = newContent.replace(/<selected>(.*?)<\/selected>/g, '**$1**');

    // 2. Handle explicit 'hightWords' prop (if used for search highlighting)
    if (props.hightWords) {
      const searchTerm = props.hightWords;
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\\]/g, '\\$&');
      const highlightRegex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
      newContent = newContent.replace(highlightRegex, '**$1**');
    }

    setContent(newContent);
  }, [props.content, props.hightWords]);

  return (
    <MessageItemContainer roleName="User">
      <MarkdownRender content={content} />
    </MessageItemContainer>
  );
};
```
