import React from 'react';
import { SelectInfo } from '@/types/epub';

type ResolveSelectionParams = {
  event: React.MouseEvent;
  container: HTMLElement;
};

const interactiveSelector =
  'a,button,input,textarea,select,option,label,[role="button"],[contenteditable="true"]';

const isEnglishChar = (char: string): boolean => /[A-Za-z]/.test(char);

const expandRangeToWord = (range: Range): { word: string; wordRange: Range } | null => {
  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE) {
    return null;
  }

  const text = node.textContent ?? '';
  let start = range.startOffset;
  let end = range.startOffset;

  while (start > 0 && isEnglishChar(text[start - 1])) {
    start -= 1;
  }

  while (end < text.length && isEnglishChar(text[end])) {
    end += 1;
  }

  if (start === end) {
    return null;
  }

  const word = text.slice(start, end);
  if (!/^[A-Za-z]+$/.test(word)) {
    return null;
  }

  const wordRange = document.createRange();
  wordRange.setStart(node, start);
  wordRange.setEnd(node, end);

  return { word, wordRange };
};

const buildContextFromRange = (
  container: HTMLElement,
  range: Range,
  word: string
): string | null => {
  if (!container.contains(range.commonAncestorContainer)) {
    return null;
  }

  const preRange = document.createRange();
  preRange.selectNodeContents(container);
  preRange.setEnd(range.startContainer, range.startOffset);
  const preText = preRange.toString();

  const postRange = document.createRange();
  postRange.selectNodeContents(container);
  postRange.setStart(range.endContainer, range.endOffset);
  const postText = postRange.toString();

  return `${preText}<selected>${word}</selected>${postText}`;
};

const getRangeFromPoint = (event: React.MouseEvent, doc: Document): Range | null => {
  const extendedDoc = doc as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
    caretPositionFromPoint?: (
      x: number,
      y: number
    ) => { offsetNode: Node | null; offset: number } | null;
  };

  if (extendedDoc.caretRangeFromPoint) {
    return extendedDoc.caretRangeFromPoint(event.clientX, event.clientY);
  }

  const position = extendedDoc.caretPositionFromPoint
    ? extendedDoc.caretPositionFromPoint(event.clientX, event.clientY)
    : null;

  if (!position || !position.offsetNode) {
    return null;
  }

  const range = doc.createRange();
  range.setStart(position.offsetNode, position.offset);
  range.collapse(true);

  return range;
};

export const resolveDrilldownSelection = ({
  event,
  container,
}: ResolveSelectionParams): SelectInfo | null => {
  const target = event.target as HTMLElement | null;
  if (!target || !container.contains(target)) {
    return null;
  }

  if (target.closest(interactiveSelector)) {
    return null;
  }

  const doc = container.ownerDocument;
  const pointRange = getRangeFromPoint(event, doc);
  if (!pointRange) {
    return null;
  }

  if (!container.contains(pointRange.startContainer)) {
    return null;
  }

  const expanded = expandRangeToWord(pointRange);
  if (!expanded) {
    return null;
  }

  const context = buildContextFromRange(container, expanded.wordRange, expanded.word);
  if (!context) {
    return null;
  }

  return {
    words: expanded.word,
    context,
  };
};
