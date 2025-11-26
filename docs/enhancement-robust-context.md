# Enhancement Specification: Robust Smart Extended Context

## 1. Problem Description
The initial "Smart Extended Context" plan (check < 20 words, add prev/next) is insufficient because:
1.  Adjacent siblings might be empty (e.g., `<br>`, empty `div`s).
2.  Adjacent siblings might *themselves* be short (e.g., rapid-fire dialogue: "Yes.", "No.", "Maybe.").
3.  Simply adding one neighbor might not reach the desired context density.

## 2. Proposed Solution: Iterative Context Accumulation
Instead of a single "if < 20 check", we will use a **while loop** (or limited iteration) to aggressively gather context outwards until a target word count (e.g., **50 words**) is met or we hit a traversal limit (e.g., **5 neighbors** in each direction).

**Algorithm:**

1.  **Initialize:**
    *   `centerNode`: The container of the user's selection.
    *   `collectedText`: The initial context with the `<selected>` tag.
    *   `totalWordCount`: Word count of `collectedText`.
    *   `TARGET_WORD_COUNT`: **50** (increased to ensure robustness).

2.  **Prepend Logic (Backwards):**
    *   Start from `prevNode = centerNode.previousSibling`.
    *   Loop while `totalWordCount < TARGET_WORD_COUNT` AND `we haven't checked too many nodes`:
        *   If `prevNode` is valid (Element node, has text):
            *   Get text.
            *   Prepend to `collectedText` (with newline).
            *   Update `totalWordCount`.
        *   Move to `prevNode.previousSibling`.

3.  **Append Logic (Forwards):**
    *   Start from `nextNode = centerNode.nextSibling`.
    *   Loop while `totalWordCount < TARGET_WORD_COUNT` AND `we haven't checked too many nodes`:
        *   If `nextNode` is valid:
            *   Get text.
            *   Append to `collectedText` (with newline).
            *   Update `totalWordCount`.
        *   Move to `nextNode.nextSibling`.

*Refinement:* To keep the context balanced, we should probably try to grab one before, then one after, then one before... but strict sequential (fill back, then fill forward) is usually acceptable and simpler for reading flow.

## 3. Implementation Logic (`src/pages/EpubReader/services/selection.service.ts`)

```typescript
// Constants
const MIN_CONTEXT_WORDS = 40; // Target for "enough" context
const MAX_NEIGHBOR_SEARCH = 5; // Don't look further than 5 paragraphs away to prevent performance issues

function extractSelectionToWords(doc: Document): SelectInfo | undefined {
  // ... (existing selection adjustment and container finding logic) ...
  
  // ... (existing preText/postText extraction) ...
  let context = `${preText}<selected>${selectedText}</selected>${postText}`;

  let currentWordCount = getWordCount(context);
  
  // Expand Backwards
  let prevNode = container.previousSibling;
  let steps = 0;
  while (currentWordCount < MIN_CONTEXT_WORDS && prevNode && steps < MAX_NEIGHBOR_SEARCH) {
    if (prevNode.nodeType === Node.ELEMENT_NODE) {
      const text = prevNode.textContent?.trim();
      if (text) {
        context = `${text}\n${context}`;
        currentWordCount += getWordCount(text);
      }
    }
    prevNode = prevNode.previousSibling;
    steps++;
  }

  // Expand Forwards (only if we still need more, or to balance it?)
  // *Decision:* It's better to always provide *some* forward context if the center is short, 
  // regardless of whether backward expansion filled the quota, to provide a balanced view.
  // But strictly following the user's prompt: "if words are not enough".
  
  // Let's reset the check or continue?
  // If we filled up on previous text, we might still want next text for continuity.
  // Let's use a soft limit for 'next' if 'prev' filled it, or a hard limit if we are still starving.
  
  let nextNode = container.nextSibling;
  steps = 0;
  // We continue expanding forward if we are still under the limit OR 
  // if we haven't grabbed at least one neighbor (for balance, optional).
  // Let's stick to the "not enough words" rule strictly first.
  
  while (currentWordCount < MIN_CONTEXT_WORDS && nextNode && steps < MAX_NEIGHBOR_SEARCH) {
    if (nextNode.nodeType === Node.ELEMENT_NODE) {
      const text = nextNode.textContent?.trim();
      if (text) {
        context = `${context}\n${text}`;
        currentWordCount += getWordCount(text);
      }
    }
    nextNode = nextNode.nextSibling;
    steps++;
  }

  return { words: selectedText, context };
}

// Helpers
function getWordCount(str: string): number {
    return str.trim().split(/\s+/).filter(w => w.length > 0).length;
}
```

## 4. Edge Case Handling
*   **Whitespace-only nodes:** The logic checks `.trim()` and `if (text)` to skip empty nodes.
*   **Navigation elements:** We check `ELEMENT_NODE`. Ideally, we'd assume the EPUB content structure is flat (paragraphs), which `epubjs` usually normalizes to.
*   **Very short neighbors:** The loop naturally handles this by continuing to the *next* neighbor until the word count increases sufficiently.
