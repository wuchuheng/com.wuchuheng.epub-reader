export type MessageType = 'info' | 'success' | 'error' | 'warning';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  duration: number;
}

export interface MessageContextType {
  info: (content: string, duration?: number) => void;
  success: (content: string, duration?: number) => void;
  error: (content: string, duration?: number) => void;
  warning: (content: string, duration?: number) => void;
}
