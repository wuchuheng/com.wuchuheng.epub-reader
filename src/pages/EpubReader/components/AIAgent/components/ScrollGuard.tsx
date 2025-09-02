import React, { useEffect, useRef } from 'react';

type ScrollGuardProps = {
  onVisible?: (visible: boolean) => void;
  /** Buffer zone in pixels. When the viewport is within this distance of the guard, it's considered visible. */
  bufferPx?: number;

  scrollContainer?: HTMLDivElement;
};

export const ScrollGuard: React.FC<ScrollGuardProps> = ({ onVisible, bufferPx = 100 }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 1. Input: prepare element and guard for browser support
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
  }, [onVisible, bufferPx]);

  return (
    <div
      ref={ref}
      className="scroll-guard"
      aria-hidden
      style={{ width: '100%', pointerEvents: 'none' }}
    >
      -- ScrollGuard --
    </div>
  );
};
