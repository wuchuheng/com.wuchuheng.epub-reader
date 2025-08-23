import React from 'react';

interface ContextMenuProps {
  tabIndex: number | null;
  words: string;
  context: string;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = (props) => {
  const [defaultSize, setDefaultSize] = React.useState(40);
  if (props.tabIndex === null) {
    return <></>;
  }

  const tabs: string[] = ['Dict', '语境', '例句', '翻译', '同义词'];

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
        <div className="p-2">
          <p>
            Words: <span className="font-bold">{props.words}</span>
          </p>
          <p>Context: {props.context}</p>
        </div>
        <div className="flex-1">Tab contenct</div>

        <div className="flex h-12 justify-between divide-x divide-black">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`w-full ${index === props.tabIndex ? 'bg-black text-white' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContextMenu;
