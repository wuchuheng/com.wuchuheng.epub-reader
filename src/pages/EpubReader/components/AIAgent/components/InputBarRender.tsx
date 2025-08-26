import React from 'react';
import { FaArrowUp, FaPen } from 'react-icons/fa6';
import { MdClose } from 'react-icons/md';

export type InputBarRenderProps = {
  status: 'idle' | 'loading';
  onStop: () => void;
  onSend: (msg: string) => void;
};
export const InputBarRender: React.FC<InputBarRenderProps> = () => {
  console.log('InputBarRender');
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      {visible && (
        <div className="sticky bottom-0 left-0 right-0 flex h-12 divide-x divide-gray-300 rounded border bg-white">
          <textarea
            className="h-full flex-1 rounded border border-black"
            placeholder="Type your message..."
          />
          <button className="flex h-12 w-12 items-center justify-center">
            <FaArrowUp className="size-6" />
          </button>
          <button
            className="flex h-12 w-12 items-center justify-center"
            onClick={() => setVisible(false)}
          >
            <MdClose className="size-6" />
          </button>
        </div>
      )}

      {!visible && (
        <div className="sticky bottom-0 h-0 w-full">
          <div className="absolute bottom-4 right-4 z-10">
            <button
              onClick={() => setVisible(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full border bg-white shadow-lg transition-colors hover:bg-gray-50"
            >
              <FaPen className="size-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
