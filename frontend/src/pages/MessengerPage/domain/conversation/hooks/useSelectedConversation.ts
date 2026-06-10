import { useConversations } from './useConversations';
import { isDraftId } from '../types/conversation';
import type { Conversation } from '../types/conversation';

export function useSelectedConversation(): Conversation | null {
  const { conversations, selectedId, draft } = useConversations();
  if (selectedId === null) {
    return null;
  }
  if (draft !== null && isDraftId(selectedId)) {
    return {
      id: selectedId,
      participants: [draft.otherUserId],
      title: draft.title,
      avatarUrl: draft.avatarUrl,
      lastMessagePreview: '',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };
  }
  return conversations.find((conversation) => conversation.id === selectedId) ?? null;
}
