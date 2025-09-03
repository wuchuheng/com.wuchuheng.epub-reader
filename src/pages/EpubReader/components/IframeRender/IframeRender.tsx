import React, { useState } from 'react';
import { replaceWords } from '../AIAgent/utils';
import { Loading } from '../Loading';

type IframeRenderProps = {
  url: string;
  context: string;
  words: string;
};

/**
 * Renders an iframe with loading state and error handling.
 * Shows a loading spinner while the iframe content is being loaded.
 * @param url - The base URL template for the iframe
 * @param context - Context for word replacement
 * @param words - Words to replace in the URL template
 * @returns Iframe component with loading state
 */
export const IframeRender: React.FC<IframeRenderProps> = ({ url, words, context }) => {
  // 1. Input validation and preparation
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // url encode the context.
  const encodedContext = encodeURIComponent(context);

  const newUrl = replaceWords({
    template: url,
    words,
    context: encodedContext,
  });

  // 2. Core processing - event handlers
  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // 3. Output rendering
  if (hasError) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-2 text-red-600">Failed to load content</p>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && <Loading />}
      <iframe
        src={newUrl}
        style={{
          display: isLoading ? 'none' : 'block',
        }}
        title="Iframe"
        className="h-full w-full"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    </>
  );
};
