import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { AISettingItem, ContextMenuSettings, SelectInfo } from '../../../types/epub';
import { AIAgent } from './AIAgent/AIAgent';
import { IframeRender } from './IframeRender/IframeRender';
import { ViewMode } from './AIAgent/components/MessageList/MessageList';

type WindowState = 'normal' | 'maximized';

type WindowPosition = {
  top: number;
  left: number;
};

type WindowSize = {
  width: number;
  height: number;
};

type ViewportSize = {
  width: number;
  height: number;
};

export interface ContextMenuProps {
  tabIndex: number | null;
  words: string;
  context: string;
  selectionId: number;
  items: ContextMenuSettings['items'];
  api: string;
  apiKey: string;
  defaultModel?: string;
  zIndex?: number;
  isTopMost: boolean;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
  onDrilldownSelect?: (selection: SelectInfo) => void;
}

const defaultSizePx = 40 * 16;
const macPattern = /Mac/;

const getViewportSize = (): ViewportSize => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
};

const getOverlayPadding = (viewportWidth: number): number =>
  viewportWidth >= 640 ? 24 : 12;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const clampSizeToViewport = (
  size: WindowSize,
  viewport: ViewportSize
): WindowSize => {
  const padding = getOverlayPadding(viewport.width);
  const maxWidth = Math.max(viewport.width - padding * 2, 0);
  const maxHeight = Math.max(viewport.height - padding * 2, 0);

  return {
    width: Math.min(size.width, maxWidth),
    height: Math.min(size.height, maxHeight),
  };
};

const clampPositionToViewport = (
  position: WindowPosition,
  size: WindowSize,
  viewport: ViewportSize
): WindowPosition => {
  const padding = getOverlayPadding(viewport.width);
  const maxLeft = padding + Math.max(viewport.width - padding * 2 - size.width, 0);
  const maxTop = padding + Math.max(viewport.height - padding * 2 - size.height, 0);

  return {
    left: clamp(position.left, padding, maxLeft),
    top: clamp(position.top, padding, maxTop),
  };
};

const getCenteredLayout = (viewport: ViewportSize): {
  size: WindowSize;
  position: WindowPosition;
} => {
  const size = clampSizeToViewport(
    { width: defaultSizePx, height: defaultSizePx },
    viewport
  );
  const padding = getOverlayPadding(viewport.width);
  const availableWidth = Math.max(viewport.width - padding * 2 - size.width, 0);
  const availableHeight = Math.max(viewport.height - padding * 2 - size.height, 0);

  return {
    size,
    position: {
      left: padding + availableWidth / 2,
      top: padding + availableHeight / 2,
    },
  };
};

const getMaximizedLayout = (viewport: ViewportSize): {
  size: WindowSize;
  position: WindowPosition;
} => {
  const padding = getOverlayPadding(viewport.width);
  const size = clampSizeToViewport(
    {
      width: Math.max(viewport.width - padding * 2, 0),
      height: Math.max(viewport.height - padding * 2, 0),
    },
    viewport
  );

  return {
    size,
    position: { left: padding, top: padding },
  };
};

const HeaderButton: React.FC<{
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}> = ({ onClick, ariaLabel, children }) => (
  <button
    type="button"
    aria-label={ariaLabel}
    onClick={onClick}
    onPointerDown={(event) => event.stopPropagation()}
    className={
      'flex h-7 w-7 items-center justify-center rounded hover:bg-black/10 ' +
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black'
    }
  >
    {children}
  </button>
);

const ContextMenu: React.FC<ContextMenuProps> = (props) => {
  const { tabIndex, onChangeIndex, isTopMost, onClose, selectionId } = props;
  const [hasInvalidIndex, setHasInvalidIndex] = useState(false);
  const [windowState, setWindowState] = useState<WindowState>('normal');
  const [viewportSize, setViewportSize] = useState<ViewportSize>(getViewportSize());
  const initialLayout = useMemo(
    () => getCenteredLayout(viewportSize),
    [viewportSize]
  );
  const [windowSize, setWindowSize] = useState<WindowSize>(initialLayout.size);
  const [position, setPosition] = useState<WindowPosition>(initialLayout.position);
  const restoreLayoutRef = useRef<{
    position: WindowPosition;
    size: WindowSize;
  } | null>(null);
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
  } | null>(null);
  const viewportRef = useRef<ViewportSize>(viewportSize);
  const positionRef = useRef<WindowPosition>(position);
  const windowSizeRef = useRef<WindowSize>(windowSize);
  const activeItems = useMemo(
    () => props.items.filter((item) => item.enabled !== false),
    [props.items]
  );
  const isMac = useMemo(
    () => typeof navigator !== 'undefined' && macPattern.test(navigator.userAgent),
    []
  );

  // Refactor: Added viewLayout state
  const [viewLayout, setViewLayout] = useState<'stackedSimple' | 'tabbedConversation'>('stackedSimple');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingRef = useRef(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const chatPortalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewportRef.current = viewportSize;
  }, [viewportSize]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    windowSizeRef.current = windowSize;
  }, [windowSize]);

  useEffect(() => {
    if (tabIndex === null) return;
    if (activeItems.length === 0) return;
    if (tabIndex < 0 || tabIndex >= activeItems.length) {
      setHasInvalidIndex(true);
      onChangeIndex(0);
    } else {
      setHasInvalidIndex(false);
    }
  }, [tabIndex, activeItems.length, onChangeIndex]);

  useEffect(() => {
    const handleResize = () => setViewportSize(getViewportSize());
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (windowState === 'maximized') {
      const maximizedLayout = getMaximizedLayout(viewportSize);
      setWindowSize(maximizedLayout.size);
      setPosition(maximizedLayout.position);
      return;
    }

    setWindowSize((prevSize) => {
      const clampedSize = clampSizeToViewport(prevSize, viewportSize);
      setPosition((prevPosition) =>
        clampPositionToViewport(prevPosition, clampedSize, viewportSize)
      );
      return clampedSize;
    });
  }, [viewportSize, windowState]);

  // Scroll Spy Logic
  useEffect(() => {
    if (viewLayout !== 'stackedSimple') return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!container) return;
      
      // Simple intersection check using middle of viewport
      const containerRect = container.getBoundingClientRect();
      const threshold = containerRect.top + containerRect.height / 2;

      let newActiveIndex = -1;
      
      sectionRefs.current.forEach((section, index) => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        if (rect.top <= threshold && rect.bottom >= threshold) {
          newActiveIndex = index;
        }
      });

      if (newActiveIndex !== -1 && newActiveIndex !== tabIndex) {
        isScrollingRef.current = true;
        onChangeIndex(newActiveIndex);
        // Reset scroll flag after a short delay to allow prop update
        setTimeout(() => { isScrollingRef.current = false; }, 100);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [viewLayout, tabIndex, activeItems, onChangeIndex]);

  // Scroll to tab logic (only when layout switches or initial load)
  useEffect(() => {
    if (viewLayout === 'stackedSimple' && !isScrollingRef.current) {
       if (tabIndex !== null && sectionRefs.current[tabIndex]) {
           // Use a small timeout to ensure rendering is complete
           setTimeout(() => {
               sectionRefs.current[tabIndex]?.scrollIntoView({ block: 'start' });
           }, 0);
       }
    }
  }, [viewLayout, selectionId, tabIndex]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const dragState = dragStateRef.current;
    if (!dragState) return;

    const viewport = viewportRef.current;
    const size = windowSizeRef.current;
    const padding = getOverlayPadding(viewport.width);
    const availableWidth = Math.max(viewport.width - padding * 2 - size.width, 0);
    const availableHeight = Math.max(viewport.height - padding * 2 - size.height, 0);
    const nextLeft = clamp(
      dragState.originLeft + (event.clientX - dragState.startX),
      padding,
      padding + availableWidth
    );
    const nextTop = clamp(
      dragState.originTop + (event.clientY - dragState.startY),
      padding,
      padding + availableHeight
    );

    setPosition({ left: nextLeft, top: nextTop });
  }, []);

  const handlePointerEnd = useCallback(() => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerEnd);
    window.removeEventListener('pointercancel', handlePointerEnd);
    dragStateRef.current = null;
  }, [handlePointerMove]);

  useEffect(
    () => () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    },
    [handlePointerEnd, handlePointerMove]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (windowState !== 'normal') return;

      dragStateRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originLeft: positionRef.current.left,
        originTop: positionRef.current.top,
      };
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerEnd);
      window.addEventListener('pointercancel', handlePointerEnd);
    },
    [handlePointerEnd, handlePointerMove, windowState]
  );

  const handleMaximize = useCallback(() => {
    const viewport = viewportRef.current;
    const maximizedLayout = getMaximizedLayout(viewport);
    restoreLayoutRef.current = {
      position: positionRef.current,
      size: windowSizeRef.current,
    };
    setWindowState('maximized');
    setWindowSize(maximizedLayout.size);
    setPosition(maximizedLayout.position);
  }, []);

  const handleRestore = useCallback(() => {
    const viewport = viewportRef.current;
    const restoreLayout = restoreLayoutRef.current || getCenteredLayout(viewport);
    const size = clampSizeToViewport(restoreLayout.size, viewport);
    const restorePosition = clampPositionToViewport(restoreLayout.position, size, viewport);

    setWindowState('normal');
    setWindowSize(size);
    setPosition(restorePosition);
  }, []);

  const handleTabClick = (index: number) => {
      onChangeIndex(index);
      // Always return to simple view when switching tabs via footer
      setViewLayout('stackedSimple');
      if (viewLayout === 'stackedSimple') {
          sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Clean up any frozen heights
      sectionRefs.current.forEach(el => { if (el) el.style.height = ''; });
  };

  const handleViewModeChange = (mode: ViewMode, index: number) => {
      const el = sectionRefs.current[index];
      if (mode === 'conversation') {
          // Freeze the height of the container before portaling out to prevent scroll jump
          if (el) el.style.height = `${el.offsetHeight}px`;
          setViewLayout('tabbedConversation');
          onChangeIndex(index);
      } else {
          // Unfreeze height
          if (el) el.style.height = '';
          setViewLayout('stackedSimple');
      }
  };

  const handleBackdropClick = useCallback(() => {
    if (!isTopMost) {
      return;
    }

    onClose();
  }, [isTopMost, onClose]);

  // ResizeObserver to measure exact content area height
  useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
              setContentHeight(entry.contentRect.height);
          }
      });

      observer.observe(container);
      return () => observer.disconnect();
  }, [viewLayout, windowSize]); // Re-attach when layout or window size changes

  if (tabIndex === null) {
    return <></>;
  }
  if (activeItems.length === 0 || hasInvalidIndex) {
    return <></>;
  }

  const resolveModel = (item: AISettingItem): string => props.defaultModel || item.model || '';
  const maximized = windowState === 'maximized';
  const windowStyle: React.CSSProperties = {
    width: `${windowSize.width}px`,
    height: `${windowSize.height}px`,
    left: `${position.left}px`,
    top: `${position.top}px`,
  };
  const closeButton = (
    <HeaderButton ariaLabel="Close window" onClick={onClose}>
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4 text-black"
        aria-hidden
      >
        <path
          d="M6 6l8 8M14 6l-8 8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </HeaderButton>
  );
  const maximizeToggleButton = (
    <HeaderButton
      ariaLabel={maximized ? 'Restore window size' : 'Maximize window'}
      onClick={maximized ? handleRestore : handleMaximize}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4 text-black"
        aria-hidden
      >
        {maximized ? (
          <path
            d="M6 7h8v8H6z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        ) : (
          <rect
            x="5"
            y="5"
            width="10"
            height="10"
            stroke="currentColor"
            strokeWidth="1.4"
            rx="1"
          />
        )}
      </svg>
    </HeaderButton>
  );
  const controls = isMac ? (
    <div className="flex items-center gap-2">
      {closeButton}
      {maximizeToggleButton}
    </div>
  ) : (
    <div className="flex items-center gap-2">
      {maximizeToggleButton}
      {closeButton}
    </div>
  );

  // Calculate content min-height for iframe sections in stacked mode
  // Header (40px) + Footer (48px) + Borders (2px) = 90px
  // Section Header: py-2 (16px) + text-xs line-height (16px) + border-b (1px) = 33px
  // Peek buffer: 40px (to allow next section to peek and improve scroll chaining)
  // Total offset = 90 + 33 + 40 = 163px.
  const chromeHeight = 90;
  const contentMinHeight = Math.max(windowSize.height - 163, 200);
  // Fallback if ResizeObserver hasn't fired yet
  const calculatedHeight = windowSize.height - chromeHeight;
  const effectiveHeight = contentHeight > 0 ? contentHeight : calculatedHeight;

  return (
    <div
      className="absolute inset-0 z-50 px-3 py-3 sm:px-6 sm:py-6"
      onClick={handleBackdropClick}
      style={props.zIndex ? { zIndex: props.zIndex } : undefined}
    >
      <div
        className="absolute flex flex-col overflow-hidden divide-y divide-black rounded border border-black
          bg-white text-black shadow-lg"
        style={windowStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative flex h-10 items-center bg-slate-100 px-3 text-sm font-medium text-black"
          onPointerDown={handlePointerDown}
          role="presentation"
        >
          <div className="flex flex-1 items-center gap-2">
            {isMac ? controls : null}
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
            Context Menu
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            {!isMac ? controls : null}
          </div>
        </div>
        
        <div className="relative flex-1 overflow-hidden">
            {/* Portal Target for Chat View - sits on top when occupied */}
            <div 
                ref={chatPortalRef} 
                className={`absolute inset-0 z-20 pointer-events-none ${viewLayout === 'tabbedConversation' ? 'block' : 'hidden'}`}
            />

            <div 
                ref={scrollContainerRef} 
                className={`h-full w-full overflow-y-auto scroll-smooth ${viewLayout === 'tabbedConversation' ? 'invisible' : ''}`}
            >
                {activeItems.map((item, index) => {
                    const paneKey = `${props.selectionId}-${index}`;
                    const isActive = index === tabIndex;
                    const wrapperClass = "border-b border-gray-200 last:border-b-0 relative";

                    return (
                        <div 
                          key={paneKey} 
                          ref={(el) => (sectionRefs.current[index] = el)}
                          className={wrapperClass}
                        >
                            {/* Section Header */}
                            <div className="sticky top-0 z-20 border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase text-gray-500">
                                {item.shortName || item.name}
                            </div>

                            {item.type === 'AI' ? (
                                 <div>
                                     <AIAgent
                                       api={props.api}
                                       apiKey={props.apiKey}
                                       words={props.words}
                                       context={props.context}
                                       model={resolveModel(item as AISettingItem)}
                                       prompt={(item as AISettingItem).prompt}
                                       reasoningEnabled={(item as AISettingItem).reasoningEnabled}
                                       onDrilldownSelect={props.onDrilldownSelect}
                                       viewMode={viewLayout === 'tabbedConversation' && isActive ? 'conversation' : 'simple'}
                                       onViewModeChange={(mode) => handleViewModeChange(mode, index)}
                                       containerHeight={effectiveHeight}
                                       chatPortalTarget={chatPortalRef.current}
                                     />
                                 </div>
                            ) : (
                                <IframeRender 
                                   url={item.url} 
                                   words={props.words} 
                                   context={props.context}
                                   minHeight={`${contentMinHeight}px`}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>

        <div className="flex h-12 justify-between divide-x divide-black">
          {activeItems.map((tab, index) => (
            <button
              onClick={() => handleTabClick(index)}
              key={index}
              className={`w-full ${index === tabIndex ? 'bg-black text-white' : ''}`}
            >
              {tab.shortName || tab.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContextMenu;
