import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { ApiError } from '@/shared/api/ApiError';
import type { User } from '@/shared/types/user';
import type { Conversation } from '../types/conversation';
import { isDraftId, makeDraftId } from '../types/conversation';
import { listConversations } from '../api/conversations';
import { ConversationsContext } from './ConversationsContext';
import type {
  ConversationsContextValue,
  ConversationsStatus,
  DraftConversation,
} from './ConversationsContext';

function sortByLastMessage(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );
}

export function ConversationsProvider({ children }: { children: ReactNode }): ReactElement {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [status, setStatus] = useState<ConversationsStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftConversation | null>(null);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    listConversations().then(
      (list) => {
        if (!active) {
          return;
        }
        setConversations(list);
        setStatus('ready');
      },
      (err: unknown) => {
        if (!active) {
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Failed to load conversations');
        setStatus('error');
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const select = useCallback((id: string): void => {
    setSelectedId(id);
    // Selecting a real conversation abandons any open draft.
    if (!isDraftId(id)) {
      setDraft(null);
    }
  }, []);

  const clearSelection = useCallback((): void => {
    setSelectedId(null);
    setDraft(null);
  }, []);

  const startDraft = useCallback((user: User): void => {
    setDraft({ otherUserId: user.id, title: user.username, avatarUrl: user.avatarUrl });
    setSelectedId(makeDraftId(user.id));
  }, []);

  const clearDraft = useCallback((): void => {
    setDraft(null);
  }, []);

  const markReadLocally = useCallback((id: string): void => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === id ? { ...conversation, unreadCount: 0 } : conversation,
      ),
    );
  }, []);

  const applyMessagePreview = useCallback((id: string, preview: string, at: string): void => {
    setConversations((prev) =>
      sortByLastMessage(
        prev.map((conversation) =>
          conversation.id === id
            ? { ...conversation, lastMessagePreview: preview, lastMessageAt: at }
            : conversation,
        ),
      ),
    );
  }, []);

  const addConversation = useCallback((conversation: Conversation): void => {
    setConversations((prev) =>
      sortByLastMessage([
        conversation,
        ...prev.filter((existing) => existing.id !== conversation.id),
      ]),
    );
  }, []);

  const value = useMemo<ConversationsContextValue>(
    () => ({
      conversations,
      status,
      error,
      selectedId,
      draft,
      select,
      clearSelection,
      startDraft,
      clearDraft,
      markReadLocally,
      applyMessagePreview,
      addConversation,
    }),
    [
      conversations,
      status,
      error,
      selectedId,
      draft,
      select,
      clearSelection,
      startDraft,
      clearDraft,
      markReadLocally,
      applyMessagePreview,
      addConversation,
    ],
  );

  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>;
}
