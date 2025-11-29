import React from 'react';

interface ReaderHelpOverlayProps {
  onClose: () => void;
}

export const ReaderHelpOverlay: React.FC<ReaderHelpOverlayProps> = ({ onClose }) => (
  <div
    className="absolute inset-0 z-40 flex h-full w-full cursor-pointer bg-black/50 text-white backdrop-blur-sm"
    onClick={(e) => {
      e.stopPropagation();
      onClose();
    }}
  >
    {/* Left Zone - Previous Page */}
    <div className="flex h-full w-[30%] items-center justify-center border-r border-white/30 hover:bg-white/10">
      <span className="select-none text-lg font-bold drop-shadow-md">Previous</span>
    </div>

    {/* Center Zone - Menu */}
    <div className="flex h-full w-[40%] items-center justify-center border-r border-white/30 hover:bg-white/10">
      <span className="select-none text-lg font-bold drop-shadow-md">Menu</span>
    </div>

    {/* Right Zone - Next Page */}
    <div className="flex h-full w-[30%] items-center justify-center hover:bg-white/10">
      <span className="select-none text-lg font-bold drop-shadow-md">Next</span>
    </div>
  </div>
);
