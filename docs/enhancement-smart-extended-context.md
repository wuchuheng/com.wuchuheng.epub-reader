# Enhancement Specification: Smart Extended Context

## 1. Problem Description
The previous fix ensured that context was always expanded to the nearest block-level ancestor (e.g., the paragraph). However, short paragraphs—such as dialogue lines like '"Home to its nest," said Peter.'—still result in insufficient context (often < 20 words). This limits the AI's ability to understand the broader scenario.

## 2. Proposed Solution
Implement a "Smart Extended Context" strategy in `extractSelectionToWords`.

**Logic:**
1.  **Initial Extraction:** Extract the context from the current block container (as currently implemented).
2.  **Word Count Check:** Calculate the word count of this extracted context.
3.  **Expansion Trigger:** If the word count is less than **20**, trigger the expansion logic.
4.  **Expansion Strategy:**
    *   **Preceding Context:** Find the previous sibling element (previous paragraph) and prepend its text.
    *   **Succeeding Context:** Find the next sibling element (next paragraph) and append its text.
    *   **Recursive/Iterative (Optional):** For this iteration, a single step of expansion (one prev, one next) is sufficient, but we will implement it such that it grabs the immediate neighbors.

## 3. Implementation Details

### 3.1. Helper: `getWordCount`
A simple utility to count words in a string.
```typescript
const getWordCount = (text: string) => text.trim().split(/\s+/).length;
```

### 3.2. Helper: `getBlockContent`
A helper to extract text content from a node, ensuring it's cleaned/normalized.
```typescript
const getBlockContent = (node: Node | null): string => {
  return node ? (node.textContent || '').trim() : '';
};
```

### 3.3. Logic Update in `extractSelectionToWords`

```typescript
// ... existing logic to find 'container' and build 'context' ...

let fullContext = context;
const currentWordCount = getWordCount(container.textContent || '');

if (currentWordCount < 20) {
  // 1. Get Previous Sibling Text
  let prevNode = container.previousSibling;
  // Skip non-element nodes (like empty text nodes between paragraphs) if needed,
  // or simply rely on textContent which handles them gracefully.
  // Better to skip to previous ELEMENT sibling for cleaner content.
  while (prevNode && prevNode.nodeType !== Node.ELEMENT_NODE) {
    prevNode = prevNode.previousSibling;
  }
  
  // 2. Get Next Sibling Text
  let nextNode = container.nextSibling;
  while (nextNode && nextNode.nodeType !== Node.ELEMENT_NODE) {
    nextNode = nextNode.nextSibling;
  }

  // 3. Construct Expanded Context
  const prevText = prevNode ? getBlockContent(prevNode) : '';
  const nextText = nextNode ? getBlockContent(nextNode) : '';
  
  // Add newlines for separation if adding paragraphs
  fullContext = `${prevText}\n${fullContext}\n${nextText}`.trim();
}

return { words: selectedText, context: fullContext };
```

## 4. Verification Plan
1.  Select a word in a short paragraph (< 20 words).
2.  Confirm that the resulting `context` string includes the text from the paragraph *above* and the paragraph *below*.
3.  Select a word in a long paragraph (> 20 words).
4.  Confirm that the context remains restricted to just that paragraph.

## 5. Constraints & Edge Cases
- **First/Last Paragraphs:** `previousSibling` or `nextSibling` might be null. The logic handles this by checking for null/undefined.
- **Non-Text Elements:** Siblings might be images or other non-text elements. `textContent` usually handles this safely (returns empty or alt text), but we prefer `ELEMENT_NODE` checks to avoid grabbing script tags or noise.
- **Performance:** DOM traversal is fast; this negligible impact.
