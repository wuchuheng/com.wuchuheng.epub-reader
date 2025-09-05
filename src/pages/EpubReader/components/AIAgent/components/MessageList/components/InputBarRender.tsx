import React from 'react';
import { FaArrowUp, FaPen } from 'react-icons/fa6';
import { MdClose } from 'react-icons/md';

export type InputBarRenderProps = {
  status: 'idle' | 'loading';
  onStop: () => void;
  onSend: (msg: string) => void;
  onVisible?: () => void;
};

/**
 * Detects if the current device is a desktop/computer screen
 * @returns true if desktop device, false if mobile device
 */
const isDesktopDevice = (): boolean => {
  // Check if it's a touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check screen size (desktop typically > 768px width)
  const isLargeScreen = window.innerWidth > 768;

  // Consider it desktop if it's not a touch device or has a large screen
  return !isTouchDevice || isLargeScreen;
};

export const InputBarRender: React.FC<InputBarRenderProps> = ({ onSend, onVisible }) => {
  const [visible, setVisible] = React.useState(false);
  const [textareaValue, setTextareaValue] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isDesktop = React.useMemo(() => isDesktopDevice(), []);

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

  // Handle keyboard events for desktop devices
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Only apply keyboard shortcuts on desktop devices
    if (!isDesktop) return;

    // Handle Enter key submission (desktop only)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Shift+Enter creates a new line (default behavior, no action needed)
  };

  const handleSubmit = () => {
    const value = textareaValue.trim();
    if (value) {
      // Call the onSend prop with the message
      onSend(textareaValue);
      // Clear the textarea
      setTextareaValue('');
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleButtonSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleOnChangeVisible = (visible: boolean) => {
    if (onVisible && visible) {
      onVisible();
    }
    setVisible(visible);
  };

  return (
    <>
      {visible && (
        <div className="sticky bottom-0 left-0 right-0 bg-transparent p-4">
          <form
            className="flex min-h-16 items-center rounded-lg border border-gray-200 bg-white shadow-lg"
            onSubmit={onSubmit}
          >
            <textarea
              name="message"
              ref={textareaRef}
              className="flex-1 resize-y rounded-l-lg border-0 px-3 py-2 outline-none focus:ring-2"
              placeholder={
                isDesktop
                  ? 'Type your message... (Press Enter to send, Shift+Enter for new line)'
                  : 'Type your message...'
              }
              rows={minRows}
              value={textareaValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              style={{ resize: 'vertical' }}
            />
            <button
              type="button"
              className="flex size-16 items-center justify-center rounded transition-colors"
              onClick={handleButtonSubmit}
            >
              <FaArrowUp className="size-5" />
            </button>
            <button
              className="flex size-16 items-center justify-center rounded-r-lg"
              onClick={() => handleOnChangeVisible(false)}
            >
              <MdClose className="size-6" />
            </button>
          </form>
        </div>
      )}

      {!visible && (
        <div className="sticky bottom-0 h-0 w-full">
          <div className="absolute bottom-4 right-4 z-10">
            <button
              onClick={() => handleOnChangeVisible(true)}
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
