import { SelectInfo } from '@/types/epub';
import { getWordCount, isInlineElement } from '../utils/domUtils';

type OnExtractSelection = (selectedInfo: SelectInfo) => void;

/**
 * Handles the end of a text selection.
 * @param doc The document containing the selection.
 * @param onExtractSelection Callback function to handle the extracted selection.
 * @returns
 */
export const handleSelectionEnd = (
  doc: Document,
  onExtractSelection: OnExtractSelection,
  onClick: () => void,

  clickPos?: { x: number; y: number }
) => {
  // 2. Handle logic.
  // 2.1 Adjust selection to word boundaries
  const result = extractSelectionToWords(doc, clickPos);

  if (result) {
    onExtractSelection(result);
  } else {
    // Rigger click event
    onClick();
  }
};

/**
 * Extracts the selected text and its context from the document.
 * @param doc The document to extract selection from.
 * @param clickPos Optional click coordinates to validate proximity.
 * @returns The extracted selection information or undefined if no valid selection exists.
 */
function extractSelectionToWords(
  doc: Document,
  clickPos?: { x: number; y: number }
): SelectInfo | undefined {
  // 1. Input handling
  const selection = doc.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);

  // 1.1 Check for empty space click (Collapsed selection not touching a word)
  if (selection.isCollapsed && clickPos) {
    const rect = range.getBoundingClientRect();

    // Calculate Euclidean distance to the closest point on the rect (simplified as point/line)
    // Rect for collapsed range has 0 width, so left=right.
    const distX = Math.max(rect.left - clickPos.x, 0, clickPos.x - rect.right);
    const distY = Math.max(rect.top - clickPos.y, 0, clickPos.y - rect.bottom);
    const distance = Math.sqrt(distX * distX + distY * distY);

    // If the click is too far from the nearest text caret position, ignore it (allow Interaction Zones)
    if (distance > 10) {
      return undefined;
    }
  }

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
