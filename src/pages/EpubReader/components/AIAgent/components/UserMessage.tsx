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
    if (!props.hightWords) return;
    // 1. Input validation
    const searchTerm = props.hightWords;
    if (!searchTerm || !props.content) return;

    // 2. Core processing - highlight words using markdown bold syntax
    // 2.1 Escape special regex characters in the search term
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 2.2 Build a case-insensitive word boundary regex for the search term
    const highlightRegex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');

    // 2.3 Replace matched words with markdown bold syntax for highlighting
    const newContent = props.content.replace(highlightRegex, '**$1**');

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
