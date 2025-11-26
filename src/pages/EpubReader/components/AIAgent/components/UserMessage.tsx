import React, { useEffect, useCallback } from 'react';
import { MarkdownRender } from './MarkdownRender';
import { MessageItemContainer } from './MessageItemContainer';

type MessageRenderProps = {
  content: string;
  hightWords?: string;
};

export const UserMessageRender: React.FC<MessageRenderProps> = (props) => {
  const [content, setContent] = React.useState(props.content);

  const onHightWords = useCallback(() => {
    let newContent = props.content;

    // 1. Pre-processing: Convert XML selection tags to Markdown for display
    newContent = newContent.replace(/<selected>(.*?)<\/selected>/g, '**$1**');

    // 2. Core processing: Highlight specific words if requested
    if (props.hightWords) {
      const searchTerm = props.hightWords;
      if (searchTerm) {
        // 2.1 Escape special regex characters
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // 2.2 Build case-insensitive word boundary regex
        const highlightRegex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
        // 2.3 Apply markdown bold syntax
        newContent = newContent.replace(highlightRegex, '**$1**');
      }
    }

    setContent(newContent);
  }, [props.content, props.hightWords]);

  useEffect(() => {
    onHightWords();
  }, [onHightWords]);

  return (
    <MessageItemContainer roleName="User">
      <MarkdownRender content={content} />
    </MessageItemContainer>
  );
};
