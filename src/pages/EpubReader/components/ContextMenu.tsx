import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { AISettingItem, ContextMenuSettings, SelectInfo } from '../../../types/epub';
import { AIAgent } from './AIAgent/AIAgent';
import { IframeRender } from './IframeRender/IframeRender';

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
  const { tabIndex, onChangeIndex } = props;
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

  if (tabIndex === null) {
    return <></>;
  }
  if (activeItems.length === 0 || hasInvalidIndex) {
    return <></>;
  }

  const resolveModel = (item: AISettingItem): string =>
    props.defaultModel || item.model || 'gpt-3.5-turbo';
  const maximized = windowState === 'maximized';
  const windowStyle: React.CSSProperties = {
    width: `${windowSize.width}px`,
    height: `${windowSize.height}px`,
    left: `${position.left}px`,
    top: `${position.top}px`,
  };
  const closeButton = (
    <HeaderButton ariaLabel="Close window" onClick={props.onClose}>
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

  return (
    <div
      className="absolute inset-0 z-50 px-3 py-3 sm:px-6 sm:py-6"
      onClick={props.onClose}
      style={props.zIndex ? { zIndex: props.zIndex } : undefined}
    >
      <div
        className="absolute flex flex-col overflow-hidden divide-y divide-black rounded border border-black
          bg-white text-black shadow-lg"
        style={windowStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex h-10 items-center bg-slate-100 px-3 text-sm font-medium text-black"
          onPointerDown={handlePointerDown}
          role="presentation"
        >
          {isMac ? controls : null}
          <div className="flex flex-1 items-center justify-center select-none">Context Menu</div>
          {!isMac ? controls : null}
        </div>
        <div className="relative flex-1 overflow-hidden">
          {activeItems.map((item, index) => {
            const isActive = index === tabIndex;
            const paneKey = `${props.selectionId}-${index}`;

            if (item.type === 'AI') {
              const aiItem = item as AISettingItem;
              const resolvedModel = resolveModel(aiItem);
              return (
                <div
                  key={paneKey}
                  className={`absolute inset-0 ${
                    isActive ? 'z-10 opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  aria-hidden={isActive ? undefined : true}
                >
                  <AIAgent
                    api={props.api}
                    apiKey={props.apiKey}
                    words={props.words}
                    context={props.context}
                    model={resolvedModel}
                    prompt={aiItem.prompt}
                    reasoningEnabled={aiItem.reasoningEnabled}
                    onDrilldownSelect={props.onDrilldownSelect}
                  />
                </div>
              );
            }

            return (
              <div
                key={paneKey}
                className={`absolute inset-0 ${
                  isActive ? 'z-10 opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                aria-hidden={isActive ? undefined : true}
              >
                <IframeRender url={item.url} words={props.words} context={props.context} />
              </div>
            );
          })}
        </div>

        <div className="flex h-12 justify-between divide-x divide-black">
          {activeItems.map((tab, index) => (
            <button
              onClick={() => onChangeIndex(index)}
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
