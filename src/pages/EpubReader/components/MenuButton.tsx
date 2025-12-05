import { useTranslation } from 'react-i18next';

type MenuButtonProps = {
  setVisible: (visible: boolean) => void;
  visible: boolean;
};
export const MenuButton: React.FC<MenuButtonProps> = (props) => {
  const { t } = useTranslation('reader');
  if (!props.visible) {
    return <></>;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        props.setVisible(true);
      }}
      className="absolute left-1 top-1 z-20 rounded-sm bg-opacity-90 text-gray-700 shadow-md transition-all duration-200 hover:bg-opacity-100 hover:shadow-lg"
      title={t('menuButton.show')}
      aria-label={t('menuButton.show')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="size-4 text-black"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
};
