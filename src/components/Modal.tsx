import React, { useEffect } from 'react';
import { MdClose } from 'react-icons/md';

interface ModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Title displayed in the header and used for accessibility label */
  title: string;
  /** Handler to close the modal */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Optional footer actions */
  footer?: React.ReactNode;
  /** Accessible label for the close button */
  closeLabel?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  footer,
  closeLabel = 'Close',
}) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500"
            aria-label={closeLabel}
          >
            <MdClose className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-3 text-gray-800">{children}</div>
        {footer ? (
          <div className="flex flex-wrap justify-end gap-2 border-t px-4 py-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
};
