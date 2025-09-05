import React, { useEffect } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { FaChevronRight } from 'react-icons/fa';

// Centralized icon styling to avoid duplication
const ICON_CLASS_NAME = 'h-20 w-4';

type ButtonContainerProps = {
  onClick: () => void;
  className?: string;
  icon: React.FC<{ className?: string }>;
};
const ButtonContainer: React.FC<ButtonContainerProps> = ({ onClick, className, icon }) => {
  const commonClassName = 'absolute  z-20 text-gray-700 ';
  console.log('Render PrevPageButton');
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const setPositionTop = () => {
    buttonRef.current!.style.top = `calc(50% - ${buttonRef.current!.offsetHeight / 2}px)`;
  };

  useEffect(() => {
    if (!buttonRef.current) {
      return;
    }
    setPositionTop();
  }, [buttonRef]);

  return (
    <button
      ref={buttonRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`${commonClassName} ${className}`}
    >
      {icon({ className: ICON_CLASS_NAME })}
    </button>
  );
};

export const PrevPageButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <ButtonContainer onClick={onClick} icon={FaChevronLeft} />
);

export const NextPageButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  console.log('Render NextPageButton');
  return <ButtonContainer onClick={onClick} icon={FaChevronRight} className="right-0" />;
};
