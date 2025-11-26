import { SelectInfo } from '@/types/epub';

type OnExtractSelection = (selectedInfo: SelectInfo) => void;

/**
 * Handles the end of a text selection.
 * @param doc The document containing the selection.
 * @param onExtractSelection Callback function to handle the extracted selection.
 * @returns
 */
export const handleSelectionEnd = (doc: Document, onExtractSelection: OnExtractSelection) => {
  // 2. Handle logic.
  // 2.1 Adjust selection to word boundaries
  const result = extractSelectionToWords(doc);

  if (!result) {
    return;
  }

  onExtractSelection(result);
};

/**
 * Extracts the selected text and its context from the document.
 * @param doc The document to extract selection from.
 * @returns The extracted selection information or undefined if no valid selection exists.
 */
function extractSelectionToWords(doc: Document): SelectInfo | undefined {
  // 1. Input handling
  const selection = doc.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);

  // 2. Core processing
  // 2.1 Adjust start to word boundaries
  while (
    range.startOffset > 0 &&
    /\w/.test(range.startContainer.textContent?.[range.startOffset - 1] ?? '')
  ) {
    range.setStart(range.startContainer, range.startOffset - 1);
  }

  // 2.2 Adjust end to word boundaries
  while (
    range.endOffset < (range.endContainer.textContent?.length ?? 0) &&
    /\w/.test(range.endContainer.textContent?.[range.endOffset] ?? '')
  ) {
    range.setEnd(range.endContainer, range.endOffset + 1);
  }

  // 2.3 Reset selection
  selection.removeAllRanges();
  selection.addRange(range);

  // 2.4 Extract expanded context
  const selectedText = selection.toString();

  // Find the meaningful container (usually a paragraph)
  let container = range.commonAncestorContainer;
  if (container.nodeType === Node.TEXT_NODE && container.parentNode) {
    container = container.parentNode;
  }

  // Walk up if it's an inline element to find the block context
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

  let context = `${preText}<selected>${selectedText}</selected>${postText}`;

  // Robust Context Expansion
  const MIN_CONTEXT_WORDS = 20;
  const MAX_NEIGHBOR_SEARCH = 5;

  let currentWordCount = getWordCount(context);

  // Expand Backwards
  let prevNode = container.previousSibling;
  let steps = 0;
  while (currentWordCount < MIN_CONTEXT_WORDS && prevNode && steps < MAX_NEIGHBOR_SEARCH) {
    if (prevNode.nodeType === Node.ELEMENT_NODE) {
      const text = prevNode.textContent?.trim();
      if (!text) {
        // Stop if previous section is empty
        break;
      }
      context = `${text}\n${context}`;
      currentWordCount += getWordCount(text);
    }
    prevNode = prevNode.previousSibling;
    steps++;
  }

  // Expand Forwards
  let nextNode = container.nextSibling;
  steps = 0;
  while (currentWordCount < MIN_CONTEXT_WORDS && nextNode && steps < MAX_NEIGHBOR_SEARCH) {
    if (nextNode.nodeType === Node.ELEMENT_NODE) {
      const text = nextNode.textContent?.trim();
      if (!text) {
        // Stop if next section is empty
        break;
      }
      context = `${context}\n${text}`;
      currentWordCount += getWordCount(text);
    }
    nextNode = nextNode.nextSibling;
    steps++;
  }

  // 3. Output handling
  return { words: selectedText, context };
}

/**
 * Helper to count words in a string
 * @param str The string to count words for
 * @returns The number of words
 */
function getWordCount(str: string): number {
  return str.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * helper to identify inline elements that shouldn't be the context boundary
 * @param node - The DOM node to check
 */
function isInlineElement(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const tagName = (node as Element).tagName.toLowerCase();
  return ['span', 'em', 'strong', 'b', 'i', 'u', 'a', 'mark', 'small', 'code'].includes(tagName);
}
