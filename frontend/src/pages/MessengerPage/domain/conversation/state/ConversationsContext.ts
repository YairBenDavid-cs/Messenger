import { createContext } from 'react';
import type { Conversation } from '../types/conversation';

export type ConversationsStatus = 'loading' | 'ready' | 'error';

export interface ConversationsContextValue {
  conversations: Conversation[];
  status: ConversationsStatus;
  error: string | null;
  selectedId: string | null;
  select: (id: string) => void;
  clearSelection: () => void;
  markReadLocally: (id: string) => void;
  applyMessagePreview: (id: string, preview: string, at: string) => void;
  addConversation: (conversation: Conversation) => void;
}

export const ConversationsContext = createContext<ConversationsContextValue | null>(null);
