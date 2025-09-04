import { SelectInfo } from '@/types/epub';
import { getContext } from '../hooks/epub.utils';

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
  // 1. Handle input.
  const selection = doc.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);

  // If collapsed (no selection), skip
  if (range.collapsed) return;

  // 2. Handle logic.
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

  // 2.3 Reset selection.
  // Clear and apply adjusted selection
  selection.removeAllRanges();
  selection.addRange(range);

  // 2.4 Extract additional context
  const selectedText = selection.toString();
  const context = getContext(range);

  // 3. return result.
  return { words: selectedText, context };
}
