import { logger } from '@/utils/logger';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MarkdownRender } from './MarkdownRender';
import { ChevronDown, ChevronRight } from '@/components/icons';

type ThinkProgressingProps = {
  reasoningContent?: string;
  content: string;
};
export const ThinkProgressing: React.FC<ThinkProgressingProps> = ({
  reasoningContent,
  content,
}) => {
  // Constants for transition configuration
  const TRANSITION_MS = 800;
  const MAX_HEIGHT_NONE = 'none';

  // 1. State management for fold/unfold functionality
  const [isReasoningFolded, setIsReasoningFolded] = useState(false);
  const [userTogglerFolded, setUserTogglerFolded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<string>(MAX_HEIGHT_NONE);
  const [isOpacityVisible, setIsOpacityVisible] = useState<boolean>(true);

  // Ensure maxHeight switches to 'none' after expand animation completes to allow auto height.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const onTransitionEnd = (e: Event) => {
      // 1. Input: ensure we only process max-height transitions
      const te = e as TransitionEvent;
      if (te.propertyName === 'max-height' && !isReasoningFolded) {
        // After expanding, let content be auto height (no clipping)
        setMaxHeight(MAX_HEIGHT_NONE);
      }
    };

    el.addEventListener('transitionend', onTransitionEnd);
    return () => el.removeEventListener('transitionend', onTransitionEnd);
  }, [isReasoningFolded]);

  // Collapse helper
  const collapse = useCallback(() => {
    // 1. Input: get element and current height
    const el = contentRef.current;
    if (!el) {
      setIsReasoningFolded(true);
      return;
    }

    const currentHeight = el.scrollHeight;

    // 2. Processing: set explicit height and animate to 0
    setMaxHeight(`${currentHeight}px`);
    requestAnimationFrame(() => {
      setIsOpacityVisible(false);
      setIsReasoningFolded(true);
      setMaxHeight('0px');
    });

    // 3. Output: no direct output, UI animates via CSS
  }, []);

  // Expand helper
  const expand = useCallback(() => {
    // 1. Input: get element
    const el = contentRef.current;
    if (!el) {
      setIsReasoningFolded(false);
      return;
    }

    // 2. Processing: prepare from 0 to measured height
    setIsReasoningFolded(false);
    setIsOpacityVisible(true);
    setMaxHeight('0px');
    requestAnimationFrame(() => {
      const target = el.scrollHeight;
      setMaxHeight(`${target}px`);
    });

    // 3. Output: after transition ends, maxHeight is switched to 'none' in transitionend handler
  }, []);

  // Auto-fold once the first content arrives, unless user has toggled
  useEffect(() => {
    const contentExisted = content.trim().length > 0;

    if (contentExisted && !isReasoningFolded && !userTogglerFolded) {
      logger.info('The reasoning content is being folded.');
      collapse();
    }
  }, [content, userTogglerFolded, isReasoningFolded, collapse]);

  // Handle user toggle with smooth expand/collapse to true auto height.
  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      // 1. Input: mark that user has interacted
      e.stopPropagation();
      setUserTogglerFolded(true);

      // 2. Processing: toggle via helpers
      if (isReasoningFolded) {
        expand();
      } else {
        collapse();
      }

      // 3. Output: UI updates via state changes
    },
    [isReasoningFolded, expand, collapse]
  );
  return (
    <>
      {reasoningContent && (
        <div className="mb-4 rounded-r-md border-l-4 border-gray-400 bg-gray-50">
          {/* 2. Clickable header with toggle functionality */}
          <div
            className="flex cursor-pointer items-center justify-between p-4 transition-colors"
            onClick={handleToggle}
            aria-expanded={!isReasoningFolded}
            aria-controls="reasoning-content"
          >
            <div className="flex items-center">
              <span className="text-sm font-medium">💭 Thinking process</span>
            </div>
            {isReasoningFolded ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
          </div>

          {/* 3. Content with true auto-height transition (max-height animation) */}
          <div
            id="reasoning-content"
            ref={contentRef}
            style={{
              maxHeight,
              opacity: isOpacityVisible ? 1 : 0,
              transition: `max-height ${TRANSITION_MS}ms ease, opacity ${TRANSITION_MS}ms ease`,
              overflow: 'hidden',
            }}
          >
            <div className="px-4 pb-4">
              <div className="text-sm text-gray-700">
                <MarkdownRender content={reasoningContent} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
