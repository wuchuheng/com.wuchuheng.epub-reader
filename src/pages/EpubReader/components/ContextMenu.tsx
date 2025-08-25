import React, { useEffect, useState } from 'react';
import { AISettingItem, ContextMenuSettings } from '../../../types/epub';
import { getContextMenuSettings } from '../../../services/OPFSManager';
import { AIAgent } from './AIAgent/AIAgent';

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

  return (
    <div
      className="absolute bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center shadow-lg"
      onClick={props.onClose}
    >
      <div
        className="flex flex-col divide-y divide-black rounded border border-black bg-white text-black"
        style={{
          width: `${defaultSize}rem`,
          height: `${defaultSize}rem`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-scroll">
          {currentItem && currentItem.type === 'AI' && (
            <AIAgent
              api={menuSetting.api}
              apiKey={menuSetting.key}
              words={props.words}
              context={props.context}
              model={AISetting!.model}
              prompt={AISetting!.prompt}
              reasoningEnabled={AISetting!.reasoningEnabled}
            />
          )}
        </div>

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
