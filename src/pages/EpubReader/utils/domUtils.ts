/**
 * Helper to count words in a string
 * @param str The string to count words for
 * @returns The number of words
 */
export function getWordCount(str: string): number {
  return str.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Helper to identify inline elements that shouldn't be the context boundary
 * @param node - The DOM node to check
 */
export function isInlineElement(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const tagName = (node as Element).tagName.toLowerCase();
  return ['span', 'em', 'strong', 'b', 'i', 'u', 'a', 'mark', 'small', 'code'].includes(tagName);
}
