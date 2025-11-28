import React, { useEffect, useMemo, useState } from 'react';
import { AISettingItem, ContextMenuSettings } from '../../../types/epub';
import { AIAgent } from './AIAgent/AIAgent';
import { IframeRender } from './IframeRender/IframeRender';

export interface ContextMenuProps {
  tabIndex: number | null;
  words: string;
  context: string;
  selectionId: number;
  items: ContextMenuSettings['items'];
  api: string;
  apiKey: string;
  defaultModel?: string;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = (props) => {
  const { tabIndex, onChangeIndex } = props;
  const defaultSize = 40;
  const [hasInvalidIndex, setHasInvalidIndex] = useState(false);
  const activeItems = useMemo(
    () => props.items.filter((item) => item.enabled !== false),
    [props.items]
  );

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

  if (tabIndex === null) {
    return <></>;
  }
  if (activeItems.length === 0 || hasInvalidIndex) {
    return <></>;
  }

  const resolveModel = (item: AISettingItem): string =>
    props.defaultModel || item.model || 'gpt-3.5-turbo';

  return (
    <div
      className="absolute bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center px-3 py-3 shadow-lg sm:px-6 sm:py-6"
      onClick={props.onClose}
    >
      <div
        className="flex flex-col overflow-hidden divide-y divide-black rounded border border-black bg-white text-black"
        style={{
          width: `${defaultSize}rem`,
          height: `${defaultSize}rem`,
          maxWidth: 'calc(100vw - 1.5rem)',
          maxHeight: 'calc(100vh - 1.5rem)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
