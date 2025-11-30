import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { AISettingItem, ContextMenuSettings, SelectInfo } from '../../../types/epub';
import { AIAgent } from './AIAgent/AIAgent';
import { IframeRender, resolveIframeUrl } from './IframeRender/IframeRender';
import { ViewMode } from './AIAgent/components/MessageList/MessageList';
import { BsPin } from 'react-icons/bs';
import { HiMiniArrowsPointingIn, HiMiniArrowsPointingOut } from 'react-icons/hi2';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { LuRefreshCcw } from 'react-icons/lu';
import { MdClose } from 'react-icons/md';

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
  pinnedMaximized: boolean;
  onPinnedChange: (isPinned: boolean) => void | Promise<void>;
  isWindowSizeLocked?: boolean;
}

const defaultSizePx = 40 * 16;
const macPattern = /Mac/;

const getViewportSize = (): ViewportSize => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
};

const getOverlayPadding = (viewportWidth: number): number => (viewportWidth >= 640 ? 24 : 12);

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const clampSizeToViewport = (size: WindowSize, viewport: ViewportSize): WindowSize => {
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

const getCenteredLayout = (
  viewport: ViewportSize
): {
  size: WindowSize;
  position: WindowPosition;
} => {
  const size = clampSizeToViewport({ width: defaultSizePx, height: defaultSizePx }, viewport);
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

const getMaximizedLayout = (
  viewport: ViewportSize
): {
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
  className?: string;
}> = ({ onClick, ariaLabel, children, className }) => (
  <button
    type="button"
    aria-label={ariaLabel}
    onClick={onClick}
    onPointerDown={(event) => event.stopPropagation()}
    className={
      'flex h-7 w-7 items-center justify-center rounded hover:bg-black/10 ' +
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black' +
      (className ? ` ${className}` : '')
    }
  >
    {children}
  </button>
);

const ContextMenu: React.FC<ContextMenuProps> = (props) => {
  const {
    tabIndex,
    onChangeIndex,
    isTopMost,
    onClose,
    selectionId,
    isWindowSizeLocked,
    pinnedMaximized,
    onPinnedChange,
  } = props;
  const windowSizeLocked = isWindowSizeLocked ?? false;
  const [hasInvalidIndex, setHasInvalidIndex] = useState(false);
  const [viewportSize, setViewportSize] = useState<ViewportSize>(getViewportSize());
  const [isPinnedMaximized, setIsPinnedMaximized] = useState<boolean>(pinnedMaximized);
  const initialLayout = useMemo(
    () => (isPinnedMaximized ? getMaximizedLayout(viewportSize) : getCenteredLayout(viewportSize)),
    [viewportSize, isPinnedMaximized]
  );
  const [windowState, setWindowState] = useState<WindowState>(
    isPinnedMaximized ? 'maximized' : 'normal'
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
  const [viewLayout, setViewLayout] = useState<'stackedSimple' | 'tabbedConversation'>(
    'stackedSimple'
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingRef = useRef(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const chatPortalRef = useRef<HTMLDivElement>(null);
  const [iframeRefreshCounters, setIframeRefreshCounters] = useState<Record<string, number>>({});

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
    setIsPinnedMaximized(pinnedMaximized);
  }, [pinnedMaximized]);

  useEffect(() => {
    setIframeRefreshCounters({});
  }, [selectionId]);

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

  useEffect(() => {
    if (!isPinnedMaximized) {
      return;
    }

    const maximizedLayout = getMaximizedLayout(viewportRef.current);
    setWindowState('maximized');
    setWindowSize(maximizedLayout.size);
    setPosition(maximizedLayout.position);
  }, [isPinnedMaximized]);

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
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 100);
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
    if (isPinnedMaximized) {
      return;
    }

    const viewport = viewportRef.current;
    const restoreLayout = restoreLayoutRef.current || getCenteredLayout(viewport);
    const size = clampSizeToViewport(restoreLayout.size, viewport);
    const restorePosition = clampPositionToViewport(restoreLayout.position, size, viewport);

    setWindowState('normal');
    setWindowSize(size);
    setPosition(restorePosition);
  }, [isPinnedMaximized]);

  const handleTabClick = (index: number) => {
    onChangeIndex(index);
    // Always return to simple view when switching tabs via footer
    setViewLayout('stackedSimple');
    if (viewLayout === 'stackedSimple') {
      sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Clean up any frozen heights
    sectionRefs.current.forEach((el) => {
      if (el) el.style.height = '';
    });
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

  const resolveModel = (item: AISettingItem): string => props.defaultModel || item.model || '';
  const maximized = windowState === 'maximized';
  const showThumbtack = maximized && !windowSizeLocked;
  const windowStyle: React.CSSProperties = {
    width: `${windowSize.width}px`,
    height: `${windowSize.height}px`,
    left: `${position.left}px`,
    top: `${position.top}px`,
  };
  const closeButton = (
    <HeaderButton ariaLabel="Close window" onClick={onClose}>
      <MdClose className="size-5" />
    </HeaderButton>
  );
  const handlePinToggle = useCallback(() => {
    setIsPinnedMaximized((prev) => {
      const next = !prev;
      onPinnedChange(next);
      return next;
    });
  }, [onPinnedChange]);

  const thumbtackButton = showThumbtack ? (
    <HeaderButton
      ariaLabel={isPinnedMaximized ? 'Unpin window' : 'Pin window'}
      onClick={handlePinToggle}
      className={isPinnedMaximized ? 'bg-gray-500 text-white hover:bg-gray-500' : ''}
    >
      <BsPin className={`h-4 w-4 ${isPinnedMaximized ? 'text-white' : 'text-black'}`} aria-hidden />
    </HeaderButton>
  ) : null;
  const maximizeToggleButton = (
    <HeaderButton
      ariaLabel={maximized ? 'Restore window size' : 'Maximize window'}
      onClick={maximized ? handleRestore : handleMaximize}
    >
      {maximized ? (
        <HiMiniArrowsPointingIn className="h-4 w-4 text-black" aria-hidden />
      ) : (
        <HiMiniArrowsPointingOut className="h-4 w-4 text-black" aria-hidden />
      )}
    </HeaderButton>
  );
  const macLeftControls = (
    <div className="flex items-center gap-2">
      {closeButton}
      {!isPinnedMaximized ? maximizeToggleButton : null}
      {thumbtackButton}
    </div>
  );
  const winRightControls = (
    <div className="flex items-center gap-2">
      {thumbtackButton}
      {!isPinnedMaximized ? maximizeToggleButton : null}
      {closeButton}
    </div>
  );
  const leadingControls = isMac ? macLeftControls : null;
  const trailingControls = isMac ? null : winRightControls;

  const handleHeaderDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (windowSizeLocked) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.closest('button')) {
        return;
      }

      if (windowState === 'maximized') {
        handleRestore();
      } else {
        handleMaximize();
      }
    },
    [handleMaximize, handleRestore, windowSizeLocked, windowState]
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
  const shouldRender =
    tabIndex !== null && activeItems.length > 0 && hasInvalidIndex === false;

  if (!shouldRender) {
    return <></>;
  }

  return (
    <div
      className="absolute inset-0 z-50 px-3 py-3 sm:px-6 sm:py-6"
      onClick={handleBackdropClick}
      style={props.zIndex ? { zIndex: props.zIndex } : undefined}
    >
      <div
        className={[
          'absolute flex flex-col divide-y divide-black overflow-hidden',
          'rounded border border-black bg-white text-black shadow-lg',
        ].join(' ')}
        style={windowStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative flex h-10 items-center bg-slate-100 px-3 text-sm font-medium text-black"
          onPointerDown={handlePointerDown}
          onDoubleClick={handleHeaderDoubleClick}
          role="presentation"
        >
          <div className="flex flex-1 items-center gap-2">{leadingControls}</div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
            Context Menu
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">{trailingControls}</div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          {/* Portal Target for Chat View - sits on top when occupied */}
          <div
            ref={chatPortalRef}
            className={`pointer-events-none absolute inset-0 z-20 ${
              viewLayout === 'tabbedConversation' ? 'block' : 'hidden'
            }`}
          />

          <div
            ref={scrollContainerRef}
            className={`h-full w-full overflow-y-auto scroll-smooth ${
              viewLayout === 'tabbedConversation' ? 'invisible' : ''
            }`}
          >
            {activeItems.map((item, index) => {
              const paneKey = `${props.selectionId}-${index}`;
              const isActive = index === tabIndex;
              const wrapperClass = 'relative border-b border-gray-200 last:border-b-0';
              const isIframe = item.type === 'iframe';
              const iframeKey = `${index}`;
              const iframeUrl = isIframe
                ? resolveIframeUrl(item.url, props.words, props.context)
                : '';
              const iframeRefreshKey = isIframe ? (iframeRefreshCounters[iframeKey] ?? 0) : 0;
              const iframeHeaderButtonClass = [
                'flex items-center justify-center rounded text-gray-500',
                'hover:bg-gray-100',
                'focus-visible:outline focus-visible:outline-2',
                'focus-visible:outline-offset-2 focus-visible:outline-black',
                'disabled:cursor-not-allowed disabled:text-gray-300',
              ].join(' ');

              return (
                <div
                  key={paneKey}
                  ref={(el) => (sectionRefs.current[index] = el)}
                  className={wrapperClass}
                >
                  {/* Section Header */}
                  <div
                    className={[
                      'sticky top-0 z-20 flex items-center justify-between',
                      'border-b border-gray-100 bg-gray-50 px-4 py-2',
                      'text-xs font-semibold uppercase text-gray-500',
                    ].join(' ')}
                  >
                    <span className="truncate">{item.shortName || item.name}</span>
                    {isIframe ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Refresh iframe"
                          className={iframeHeaderButtonClass}
                          onClick={() =>
                            setIframeRefreshCounters((prev) => ({
                              ...prev,
                              [iframeKey]: (prev[iframeKey] ?? 0) + 1,
                            }))
                          }
                          disabled={!iframeUrl}
                        >
                          <LuRefreshCcw className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          aria-label="Open iframe in new window"
                          className={iframeHeaderButtonClass}
                          onClick={() =>
                            iframeUrl && window.open(iframeUrl, '_blank', 'noreferrer noopener')
                          }
                          disabled={!iframeUrl}
                        >
                          <FaExternalLinkAlt className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    ) : null}
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
                        viewMode={
                          viewLayout === 'tabbedConversation' && isActive
                            ? 'conversation'
                            : 'simple'
                        }
                        onViewModeChange={(mode) => handleViewModeChange(mode, index)}
                        containerHeight={effectiveHeight}
                        chatPortalTarget={chatPortalRef.current}
                      />
                    </div>
                  ) : (
                    <IframeRender
                      key={`${paneKey}-${iframeRefreshKey}`}
                      url={item.url}
                      words={props.words}
                      context={props.context}
                      minHeight={`${contentMinHeight}px`}
                    />
                  )}
                </div>
              );
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
