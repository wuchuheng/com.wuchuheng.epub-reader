/**
 * Creates a caret range from touch coordinates using the browser's caret position API.
 * Converts touch coordinates into a DOM range for text selection operations.
 * @param document The document object for DOM manipulation.
 * @param window The window object for scroll calculations.
 * @param clientX The horizontal touch coordinate.
 * @param clientY The vertical touch coordinate.
 * @returns A Range object at the specified position, or null if creation fails.
 */
export const createCaretRange = (
  document: Document,
  window: Window,
  clientX: number,
  clientY: number
): Range | null => {
  try {
    const adjustedX = clientX - window.scrollX;
    const adjustedY = clientY - window.scrollY;

    const caretPosition = (
      document as {
        caretPositionFromPoint?(
          x: number,
          y: number
        ):
          | {
              offsetNode: Node;
              offset: number;
            }
          | undefined;
      }
    ).caretPositionFromPoint?.(adjustedX, adjustedY);

    if (!caretPosition) return null;

    const range = document.createRange();
    range.setStart(caretPosition.offsetNode, caretPosition.offset);
    range.setEnd(caretPosition.offsetNode, caretPosition.offset);
    return range;
  } catch {
    return null;
  }
};
