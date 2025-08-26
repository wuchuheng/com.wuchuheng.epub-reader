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
  const [textareaValue, setTextareaValue] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const minRows = 1;
  // Auto-resize textarea based on content
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextareaValue(value);

    // Reset height to calculate new height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';

      // Calculate number of lines
      const maxRows = 8;
      const currentRows = value.split('\n').length;
      const newRows = currentRows > maxRows ? maxRows : currentRows;

      // Set new height
      textareaRef.current.rows = newRows;
    }
  };

  return (
    <>
      {visible && (
        <div className="sticky bottom-0 left-0 right-0 bg-transparent p-4">
          <div className="flex min-h-16 items-center rounded-lg border border-gray-200 bg-white shadow-lg">
            <textarea
              ref={textareaRef}
              className="flex-1 resize-y rounded-l-lg border-0 px-3 py-2 outline-none focus:ring-2"
              placeholder="Type your message..."
              rows={minRows}
              value={textareaValue}
              onChange={handleTextareaChange}
              style={{ resize: 'vertical' }}
            />
            <button className="flex size-16 items-center justify-center rounded transition-colors">
              <FaArrowUp className="size-5" />
            </button>
            <button
              className="flex size-16 items-center justify-center rounded-r-lg"
              onClick={() => setVisible(false)}
            >
              <MdClose className="size-6" />
            </button>
          </div>
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
