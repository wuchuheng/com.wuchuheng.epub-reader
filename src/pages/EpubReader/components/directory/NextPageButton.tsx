import { FaChevronLeft } from 'react-icons/fa';
import { FaChevronRight } from 'react-icons/fa';

const commonClassName = 'absolute top-[50%]  z-20 text-gray-700 ';

export const PrevPageButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  console.log('Render PrevPageButton');
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={commonClassName}
    >
      <FaChevronLeft className="h-20 w-6" />
    </button>
  );
};

export const NextPageButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  console.log('Render NextPageButton');
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`${commonClassName} right-0`}
    >
      <FaChevronRight className="h-20 w-6" />
    </button>
  );
};
