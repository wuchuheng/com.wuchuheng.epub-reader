import React, { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { Message, MessageType } from './types';
import { MessageItem } from './MessageItem';
import { MessageContext } from './MessageContext';

// eslint-disable-next-line react-refresh/only-export-components
export { useMessage } from './useMessage';

let idCounter = 0;

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Helper to remove message
  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const addMessage = useCallback((type: MessageType, content: string, duration: number = 3000) => {
    const id = `msg_${Date.now()}_${idCounter++}`;
    setMessages((prev) => [...prev, { id, type, content, duration }]);
  }, []);

  const info = useCallback((content: string, duration?: number) => addMessage('info', content, duration), [addMessage]);
  const success = useCallback((content: string, duration?: number) => addMessage('success', content, duration), [addMessage]);
  const error = useCallback((content: string, duration?: number) => addMessage('error', content, duration), [addMessage]);
  const warning = useCallback((content: string, duration?: number) => addMessage('warning', content, duration), [addMessage]);

  return (
    <MessageContext.Provider value={{ info, success, error, warning }}>
      {children}
      {createPortal(
        <div className="fixed top-4 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center pointer-events-none">
          {messages.map((msg, index) => (
            <MessageItem key={msg.id} message={msg} index={index} onClose={removeMessage} />
          ))}
        </div>,
        document.body
      )}
    </MessageContext.Provider>
  );
};