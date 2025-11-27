import React, { useEffect, useState } from 'react';
import { AISettingItem, ContextMenuSettings, IframeSettingItem } from '../../../types/epub';
import { getContextMenuSettings } from '../../../services/OPFSManager';
import { AIAgent } from './AIAgent/AIAgent';
import { IframeRender } from './IframeRender/IframeRender';

export interface ContextMenuProps {
  tabIndex: number | null;
  words: string;
  context: string;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = (props) => {
  const [defaultSize] = React.useState(40);
  const [menuSetting, setMenuSetting] = useState<ContextMenuSettings | null>(null);

  // Load the setting from OPFS
  useEffect(() => {
    getContextMenuSettings().then((settings) => setMenuSetting(settings));
  }, []);

  if (props.tabIndex === null || menuSetting === null) {
    return <></>;
  }

  const currentItem = menuSetting.items[props.tabIndex];
  const AISetting: AISettingItem | null =
    currentItem && currentItem.type === 'AI' ? (currentItem as AISettingItem) : null;

  const iframeSettings: IframeSettingItem | null =
    currentItem && currentItem.type === 'iframe' ? (currentItem as IframeSettingItem) : null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center px-3 py-3 sm:px-6 sm:py-6 shadow-lg"
      onClick={props.onClose}
    >
      <div
        className="flex flex-col divide-y divide-black rounded border border-black bg-white text-black overflow-hidden"
        style={{
          width: `${defaultSize}rem`,
          height: `${defaultSize}rem`,
          maxWidth: 'calc(100vw - 1.5rem)',
          maxHeight: 'calc(100vh - 1.5rem)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {currentItem && currentItem.type === 'AI' && (
          <AIAgent
            key={props.tabIndex} // Use key to force remount when switching tabs
            api={menuSetting.api}
            apiKey={menuSetting.key}
            words={props.words}
            context={props.context}
            model={AISetting!.model}
            prompt={AISetting!.prompt}
            reasoningEnabled={AISetting!.reasoningEnabled}
          />
        )}

        {currentItem && currentItem.type === 'iframe' && (
          <IframeRender url={iframeSettings!.url} words={props.words} context={props.context} />
        )}

        <div className="flex h-12 justify-between divide-x divide-black">
          {menuSetting?.items.map((tab, index) => (
            <button
              onClick={() => props.onChangeIndex(index)}
              key={index}
              className={`w-full ${index === props.tabIndex ? 'bg-black text-white' : ''}`}
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
