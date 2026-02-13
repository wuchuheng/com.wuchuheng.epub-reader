import React from 'react';

interface LoadingProps {
  message?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Awaiting AI response...', className = '' }) => {
  return (
    <div className={`flex h-full min-h-[200px] w-full flex-col items-center justify-center p-4 ${className}`}>
      <div className="mb-4 flex flex-col items-center gap-4">
        <img src="/logo.svg" alt="Loading" className="h-20 w-20 animate-pulse" />
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></div>
          <span className="ml-1 font-medium italic">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default Loading;
