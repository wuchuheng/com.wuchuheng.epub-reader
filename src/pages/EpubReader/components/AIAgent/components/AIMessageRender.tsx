import React from 'react';
import { MarkdownRender } from './MarkdownRender';
import { MessageItemContainer } from './MessageItemContainer';

type AIMessageRenderProps = {
  content: string;
  reasoningContent?: string;
};
export const AIMessageRender: React.FC<AIMessageRenderProps> = (props) => {
  console.log(props);
  return (
    <>
      <MessageItemContainer roleName="Agent">
        {props.reasoningContent && (
          <div className="mb-4 rounded-r-md border-l-4 border-blue-400 bg-blue-50 p-4">
            <div className="mb-2 flex items-center">
              <span className="text-sm font-medium text-blue-800">💭 Thinking process</span>
            </div>
            <div className="text-sm text-gray-700">
              <MarkdownRender content={props.reasoningContent} />
            </div>
          </div>
        )}
        <MarkdownRender content={props.content} />
      </MessageItemContainer>
    </>
  );
};
