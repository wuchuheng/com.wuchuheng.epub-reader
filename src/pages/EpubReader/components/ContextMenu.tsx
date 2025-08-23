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

  return (
    <div
      className="absolute bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center rounded border p-2 shadow-lg"
      onClick={props.onClose}
    >
      <div
        className="relative rounded bg-white p-4 shadow-lg"
        style={{
          width: `${defaultSize}rem`,
          height: `${defaultSize}rem`,
        }}
      >
        hello
      </div>
    </div>
  );
};

export default ContextMenu;
