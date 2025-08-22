type MenuButtonProps = {
  setVisible: (visible: boolean) => void;
  visible: boolean;
};
export const MenuButton: React.FC<MenuButtonProps> = (props) => {
  if (!props.visible) {
    return <></>;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        props.setVisible(true);
      }}
      className="absolute left-4 top-4 z-20 rounded-lg bg-white bg-opacity-90 p-2 text-gray-700 shadow-md transition-all duration-200 hover:bg-opacity-100 hover:shadow-lg"
      title="Show menu"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
};
