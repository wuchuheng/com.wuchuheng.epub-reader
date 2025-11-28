import React from 'react';
import { FaArrowUp } from 'react-icons/fa6';
import { MdClose } from 'react-icons/md';

export type InputBarRenderProps = {
  onSend: (msg: string) => void;
  onVisible?: () => void;
  mode: 'simple' | 'conversation';
  onModeChange: (mode: 'simple' | 'conversation') => void;
};

/**
 * Detects if the current device is a desktop/computer screen
 * @returns true if desktop device, false if mobile device
 */
const isDesktopDevice = (): boolean => {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isLargeScreen = window.innerWidth > 768;

  return !isTouchDevice || isLargeScreen;
};

export const InputBarRender: React.FC<InputBarRenderProps> = ({
  onSend,
  mode,
  onModeChange,
}) => {
  const [textareaValue, setTextareaValue] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isDesktop = React.useMemo(() => isDesktopDevice(), []);

  const minRows = 1;
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextareaValue(value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';

      const maxRows = 8;
      const currentRows = value.split('\n').length;
      const newRows = currentRows > maxRows ? maxRows : currentRows;

      textareaRef.current.rows = newRows;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isDesktop) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const value = textareaValue.trim();
    if (value) {
      onSend(textareaValue);
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

  React.useEffect(() => {
    if (mode === 'conversation' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [mode]);

  if (mode === 'conversation') {
    return (
      <div className="sticky bottom-0 left-0 right-0 bg-transparent p-4">
        <form
          className="flex min-h-16 items-center rounded-lg border border-gray-200 bg-white shadow-lg"
          onSubmit={onSubmit}
        >
          <textarea
            name="message"
            ref={textareaRef}
            className="flex-1 resize-y rounded-l-lg border-0 px-3 outline-none focus:ring-0"
            placeholder={
              isDesktop
                ? 'Type your message... (Press Enter to send, Shift+Enter for new line)'
                : 'Type your message...'
            }
            rows={minRows}
            value={textareaValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            style={{ resize: 'none' }}
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
            onClick={() => onModeChange('simple')}
            type="button"
          >
            <MdClose className="size-6" />
          </button>
        </form>
      </div>
    );
  }

  return null;
};
