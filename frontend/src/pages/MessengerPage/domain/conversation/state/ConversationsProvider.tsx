import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { ApiError } from '@/shared/api/ApiError';
import type { Conversation } from '../types/conversation';
import { listConversations } from '../api/conversations';
import { ConversationsContext } from './ConversationsContext';
import type { ConversationsContextValue, ConversationsStatus } from './ConversationsContext';

export function ConversationsProvider({ children }: { children: ReactNode }): ReactElement {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [status, setStatus] = useState<ConversationsStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
  }, []);

  const clearSelection = useCallback((): void => {
    setSelectedId(null);
  }, []);

  const markReadLocally = useCallback((id: string): void => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === id ? { ...conversation, unreadCount: 0 } : conversation,
      ),
    );
  }, []);

  const applyMessagePreview = useCallback((id: string, preview: string, at: string): void => {
    setConversations((prev) => {
      const updated = prev.map((conversation) =>
        conversation.id === id
          ? { ...conversation, lastMessagePreview: preview, lastMessageAt: at }
          : conversation,
      );
      return [...updated].sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
      );
    });
  }, []);

  const value = useMemo<ConversationsContextValue>(
    () => ({
      conversations,
      status,
      error,
      selectedId,
      select,
      clearSelection,
      markReadLocally,
      applyMessagePreview,
    }),
    [
      conversations,
      status,
      error,
      selectedId,
      select,
      clearSelection,
      markReadLocally,
      applyMessagePreview,
    ],
  );

  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>;
}
