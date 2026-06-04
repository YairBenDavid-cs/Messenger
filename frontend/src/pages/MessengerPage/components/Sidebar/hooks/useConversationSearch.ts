import { useMemo, useState } from 'react';
import type { Conversation } from '@/pages/MessengerPage/domain/conversation/types/conversation';

interface UseConversationSearch {
  query: string;
  setQuery: (value: string) => void;
  filtered: Conversation[];
}

export function useConversationSearch(conversations: Conversation[]): UseConversationSearch {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === '') {
      return conversations;
    }
    return conversations.filter(
      (conversation) =>
        conversation.title.toLowerCase().includes(needle) ||
        conversation.lastMessagePreview.toLowerCase().includes(needle),
    );
  }, [conversations, query]);

  return { query, setQuery, filtered };
}
