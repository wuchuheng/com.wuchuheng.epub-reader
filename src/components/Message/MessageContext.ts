import { createContext } from 'react';
import { MessageContextType } from './types';

export const MessageContext = createContext<MessageContextType | null>(null);
