import React, { useMemo, useState } from 'react';
import { replaceWords } from '../AIAgent/utils';
import { Loading } from '../Loading';

type IframeRenderProps = {
  url: string;
  context: string;
  words: string;
  minHeight?: number | string;
};

/**
 * Renders an iframe with loading state and error handling.
 * Shows a loading spinner while the iframe content is being loaded.
 * @param url - The base URL template for the iframe
 * @param context - Context for word replacement
 * @param words - Words to replace in the URL template
 * @returns Iframe component with loading state
 */
// eslint-disable-next-line react-refresh/only-export-components
export const resolveIframeUrl = (template: string, words: string, context: string): string =>
  replaceWords({
    template,
    words: encodeURIComponent(words),
    context: encodeURIComponent(context),
    wrapContext: false,
  });

export const IframeRender: React.FC<IframeRenderProps> = ({
  url,
  words,
  context,
  minHeight,
}) => {
  // 1. Input validation and preparation
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const resolvedUrl = useMemo(
    () => resolveIframeUrl(url, words, context),
    [context, url, words]
  );

  // 2. Core processing - event handlers
  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setHasLoadedOnce(true);
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
    <div className="relative w-full overflow-hidden" style={{ height: minHeight || '100%' }}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50">
          <Loading />
        </div>
      )}
      <iframe
        src={resolvedUrl}
        title="Iframe"
        className="h-full w-full border-0"
        style={{
          visibility: isLoading && !hasLoadedOnce ? 'hidden' : 'visible',
          borderRadius: 'inherit',
        }}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    </div>
  );
};
