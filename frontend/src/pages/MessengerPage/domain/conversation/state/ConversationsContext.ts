import { createContext } from 'react';
import type { Conversation } from '../types/conversation';
import type { User } from '@/shared/types/user';

export type ConversationsStatus = 'loading' | 'ready' | 'error';

export interface DraftConversation {
  otherUserId: string;
  title: string;
  avatarUrl: string;
}

export interface ConversationsContextValue {
  conversations: Conversation[];
  status: ConversationsStatus;
  error: string | null;
  selectedId: string | null;
  draft: DraftConversation | null;
  select: (id: string) => void;
  clearSelection: () => void;
  startDraft: (user: User) => void;
  clearDraft: () => void;
  markReadLocally: (id: string) => void;
  applyMessagePreview: (id: string, preview: string, at: string) => void;
  addConversation: (conversation: Conversation) => void;
}

export const ConversationsContext = createContext<ConversationsContextValue | null>(null);
