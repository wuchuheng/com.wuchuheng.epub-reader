import React from 'react';
import { useTranslation } from 'react-i18next';

interface ReaderHelpOverlayProps {
  onClose: () => void;
}

export const ReaderHelpOverlay: React.FC<ReaderHelpOverlayProps> = ({ onClose }) => {
  const { t } = useTranslation('reader');

  return (
    <div
      className="absolute inset-0 z-40 flex h-full w-full cursor-pointer bg-black/50 text-white backdrop-blur-sm"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      {/* Left Zone - Previous Page */}
      <div className="flex h-full w-[20%] items-center justify-center border-r border-white/30 hover:bg-white/10">
        <span className="select-none text-lg font-bold drop-shadow-md">
          {t('helpOverlay.previous')}
        </span>
      </div>

      {/* Center Zone - Menu */}
      <div className="flex h-full w-[60%] items-center justify-center border-r border-white/30 hover:bg-white/10">
        <span className="select-none text-lg font-bold drop-shadow-md">
          {t('helpOverlay.menu')}
        </span>
      </div>

      {/* Right Zone - Next Page */}
      <div className="flex h-full w-[20%] items-center justify-center hover:bg-white/10">
        <span className="select-none text-lg font-bold drop-shadow-md">
          {t('helpOverlay.next')}
        </span>
      </div>
    </div>
  );
};
