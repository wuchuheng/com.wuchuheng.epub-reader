# Enhancement Specification: Expanded Selection Context

## 1. Problem Description
When a user selects text within a short or fragmented paragraph (e.g., `"Home to its nest," said Peter.`), the extracted context is often insufficient. This limits the effectiveness of features that rely on context, such as AI explanations or translations.

The root cause is the current implementation of `extractSelectionToWords` in `src/pages/EpubReader/services/selection.service.ts`, which only considers the text content of the immediate start and end containers of the selection range. It fails to capture the broader context provided by the surrounding paragraph or block element.

## 2. Solution Overview
The solution is to expand the context extraction logic to include the full text content of the closest block-level ancestor (e.g., `<p>`, `<div>`, `<blockquote>`) that contains the user's selection. This ensures that even if the selection spans multiple inline elements (like `<span>`, `<em>`, `<b>`), the entire semantic unit (the paragraph) is captured as context.

## 3. Implementation Details

### 3.1. Core Logic Change: `extractSelectionToWords`
**File:** `src/pages/EpubReader/services/selection.service.ts`

**Current Logic:**
```typescript
const startContent = range.startContainer.textContent!.slice(0, range.startOffset);
const endContent = range.endContainer.textContent!.slice(range.endOffset);
const context = `${startContent}**${selectedText}**${endContent}`;
```

**Proposed Logic:**
1.  **Identify Context Container:**
    *   Find the `commonAncestorContainer` of the selection range.
    *   Traverse up the DOM tree from this container to find the nearest block-level element (or use the container itself if it's already a block).
    *   Typically, we are looking for a `<p>` tag, but falling back to the `commonAncestorContainer`'s parent (if it's a text node) is a robust start.

2.  **Extract Full Text:**
    *   Get the `textContent` of this container. This represents the full paragraph.

3.  **Locate Selection within Container:**
    *   This is the tricky part because `textContent` strips out HTML tags. We need to map the user's selection range to the indices in the plain `textContent` string.
    *   Alternatively, and simpler for our use case:
        *   Clone the range.
        *   Expand the cloned range to encompass the entire context container.
        *   But a more robust way that preserves the "highlight" marker (`**...**`) is needed.

    **Refined Approach for Context Construction:**
    Instead of complex index mapping, we can construct the context string by traversing the text nodes within the context container.
    *   However, a simpler heuristic often works well for "context":
        *   `contextElement = getBlockAncestor(range.commonAncestorContainer)`
        *   `fullText = contextElement.textContent`
        *   `selectedText = selection.toString()`
        *   `context = fullText.replace(selectedText, "**" + selectedText + "**")`
    *   *Risk:* If the selected text appears multiple times in the paragraph, `replace` might highlight the wrong one.
    *   *Better Approach:*
        *   Use `range.surroundContents` (temporarily) or `Range` comparison APIs to precisely locate the selection relative to the container's start.
        *   Or, stick to the current logic for *positioning* but look wider for the *content*.

    **Recommended Algorithm:**
    1.  **Start Node:** `range.startContainer`.
    2.  **End Node:** `range.endContainer`.
    3.  **Context Container:** `range.commonAncestorContainer` (or its parent if it's a text node).
    4.  **Pre-text:** Traverse backwards from `range.startContainer` within the `Context Container` to collect all preceding text.
    5.  **Post-text:** Traverse forwards from `range.endContainer` within the `Context Container` to collect all following text.
    6.  **Result:** `Pre-text + "**" + selectedText + "**" + Post-text`.

### 3.2. Algorithm Refinement (Traversal)
To correctly gather "Pre-text" and "Post-text" without complex DOM traversal code, we can use `Range` objects:

*   **Pre-text Range:**
    *   `preRange = document.createRange()`
    *   `preRange.selectNodeContents(contextContainer)`
    *   `preRange.setEnd(range.startContainer, range.startOffset)`
    *   `preText = preRange.toString()`

*   **Post-text Range:**
    *   `postRange = document.createRange()`
    *   `postRange.selectNodeContents(contextContainer)`
    *   `postRange.setStart(range.endContainer, range.endOffset)`
    *   `postText = postRange.toString()`

*   **Context Container Determination:**
    *   If `range.commonAncestorContainer` is a generic block (like a `div` or `p`), use it.
    *   If it is a text node, use `parentNode`.
    *   Ideally, check if the parent is a "sentence-like" block. If `epubjs` renders everything in `p` tags, relying on the parent block is safe.

## 4. Proposed Code Structure

```typescript
function extractSelectionToWords(doc: Document): SelectInfo | undefined {
  // ... (existing word boundary adjustment logic) ...

  // 2.4 Extract additional context
  const selectedText = selection.toString();

  // Find the meaningful container (usually a paragraph)
  let container = range.commonAncestorContainer;
  if (container.nodeType === Node.TEXT_NODE && container.parentNode) {
    container = container.parentNode;
  }
  // Optional: Walk up if it's an inline element (span, em, strong) to find the block
  while (container.parentNode && isInlineElement(container)) {
    container = container.parentNode;
  }

  // Use Ranges to grab text before and after the selection within this container
  const preRange = doc.createRange();
  preRange.selectNodeContents(container);
  preRange.setEnd(range.startContainer, range.startOffset);
  const preText = preRange.toString();

  const postRange = doc.createRange();
  postRange.selectNodeContents(container);
  postRange.setStart(range.endContainer, range.endOffset);
  const postText = postRange.toString();

  const context = `${preText}**${selectedText}**${postText}`;

  // 3. return result.
  return { words: selectedText, context };
}

// Helper to identify inline elements that shouldn't be the context boundary
function isInlineElement(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const tagName = (node as Element).tagName.toLowerCase();
  return ['span', 'em', 'strong', 'b', 'i', 'u', 'a', 'mark'].includes(tagName);
}
```

## 5. Verification Plan
1.  Select a word in a normal paragraph. Verify `context` is the full paragraph.
2.  Select a word in a short sentence. Verify `context` captures the sentence.
3.  Select a word inside a `<span>` or `<em>` tag. Verify `context` expands to the parent block (e.g., the `<p>`), not just the `<span>`.
