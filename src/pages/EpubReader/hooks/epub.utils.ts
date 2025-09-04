/**
 * Creates a storage manager for managing local storage with a specific prefix.
 * @param prefix The prefix to use for all storage keys.
 * @returns An object with `get` and `set` methods for interacting with local storage.
 */
export const createStorageManager = (prefix: string) => ({
  get: (key: string): string | null => localStorage.getItem(`${prefix}${key}`),
  set: (key: string, value: string): void => localStorage.setItem(`${prefix}${key}`, value),
});

/**
 * Finds the closest paragraph element to the given node.
 * @param node The starting node.
 * @returns The closest paragraph element or null if not found.
 */
export const getContext = (range: Range): string => {
  const paragraphTags = ['p', 'div', 'section', 'article', 'li'];
  let current: Node | null = range.commonAncestorContainer;
  while (current && current.nodeType !== Node.DOCUMENT_NODE) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const element = current as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      if (paragraphTags.includes(tagName) || element.classList.contains('paragraph')) {
        return element.textContent || '';
      }
    }
    current = current.parentNode;
  }

  return '';
};
