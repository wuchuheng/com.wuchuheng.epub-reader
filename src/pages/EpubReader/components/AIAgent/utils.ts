type ReplaceWordsProps = {
  template: string;
  words: string;
  context?: string;
};

/**
 * Replaces placeholders in a template string with the provided words and context.
 * @param param0 - The parameters containing the template, words, and optional context.
 * @returns The modified template string with placeholders replaced.
 */
export const replaceWords = ({ template, words, context }: ReplaceWordsProps): string => {
  let result = template.replace(/\{\{words\}\}/g, words);

  if (context) {
    result = result.replace(/\{\{context\}\}/g, context);
  }

  return result;
};
