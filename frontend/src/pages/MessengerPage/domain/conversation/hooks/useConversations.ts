import { useContext } from 'react';
import { ConversationsContext } from '../state/ConversationsContext';
import type { ConversationsContextValue } from '../state/ConversationsContext';

export function useConversations(): ConversationsContextValue {
  const context = useContext(ConversationsContext);
  if (context === null) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return context;
}
