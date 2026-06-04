import { useConversations } from './useConversations';
import type { Conversation } from '../types/conversation';

export function useSelectedConversation(): Conversation | null {
  const { conversations, selectedId } = useConversations();
  if (selectedId === null) {
    return null;
  }
  return conversations.find((conversation) => conversation.id === selectedId) ?? null;
}
