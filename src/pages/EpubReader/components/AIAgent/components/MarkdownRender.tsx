import React, { useMemo } from 'react';
import remarkGfm from 'remark-gfm';
import ReactMarkdown, { Components } from 'react-markdown';

type MarkdownRenderProps = {
  content: string;
};
export const MarkdownRender: React.FC<MarkdownRenderProps> = (props) => {
  // Memoize markdown components for better performance
  const markdownComponents: Components = useMemo(
    () => ({
      // Custom styling for highlighted text (bold markdown becomes red and bold)
      strong: ({ children }) => <strong className="font-bold">{children}</strong>,

      // Heading styles with strong font weights and spacing
      h1: ({ children }) => (
        <h1 className="my-4 border-b-2 border-gray-200 pb-2 text-2xl font-black text-gray-900">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="my-3 text-xl font-extrabold text-gray-800">{children}</h2>
      ),
      h3: ({ children }) => <h3 className="my-2 text-lg font-bold text-gray-700">{children}</h3>,

      // Add spacing for paragraphs and other elements
      p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,

      // Style code blocks with spacing
      code: ({ children }) => (
        <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm">{children}</code>
      ),

      // Style code blocks (pre) with spacing
      pre: ({ children }) => (
        <pre className="mb-4 overflow-x-scroll rounded-md bg-gray-100 p-3 text-sm">{children}</pre>
      ),

      // Style links
      a: ({ href, children, ...props }) => (
        <a
          href={href}
          className="text-blue-600 underline hover:text-blue-800"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      ),

      // Style blockquotes with spacing
      blockquote: ({ children }) => (
        <blockquote className="my-4 border-l-4 border-gray-300 pl-4 italic text-gray-700">
          {children}
        </blockquote>
      ),

      // Style lists with spacing
      ul: ({ children }) => <ul className="mb-4 space-y-1 pl-6">{children}</ul>,
      ol: ({ children }) => <ol className="mb-4 space-y-1 pl-6">{children}</ol>,

      // Style list items
      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    }),
    []
  );
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {props.content}
    </ReactMarkdown>
  );
};
